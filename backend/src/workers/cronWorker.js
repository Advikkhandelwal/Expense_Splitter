import cron from "node-cron";
import prisma from "../prisma/client.js";

/**
 * Calculates the next occurrence based on frequency
 * @param {Date} lastDate 
 * @param {string} frequency 
 * @returns {Date}
 */
const calculateNextDate = (lastDate, frequency) => {
    const next = new Date(lastDate);
    if (frequency === "daily") next.setDate(next.getDate() + 1);
    else if (frequency === "weekly") next.setDate(next.getDate() + 7);
    else if (frequency === "monthly") next.setMonth(next.getMonth() + 1);
    else if (frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
    return next;
};

/**
 * Core logic to process recurring expenses
 */
export const processRecurringExpenses = async () => {
    console.log("🔄 Checking for recurring expenses to process...");

    const now = new Date();

    try {
        // Find all recurring expenses where next_occurrence is now or in the past
        const recurringExpenses = await prisma.expense.findMany({
            where: {
                is_recurring: true,
                next_occurrence: {
                    lte: now,
                },
            },
            include: {
                splits: true,
            },
        });

        console.log(`Found ${recurringExpenses.length} expenses to process.`);

        for (const exp of recurringExpenses) {
            // 1. Create a new expense as a copy (but not recurring itself or updated next_occurrence)
            // Actually, we keep the original as "recurring template" and create copies
            // Or we update the original's next_occurrence and create a non-recurring copy for the record.

            // Preferred way: The current expense is the "template". We update its next_occurrence 
            // and create a new non-recurring expense for the actual transaction record.

            await prisma.$transaction(async (tx) => {
                // Create the new transaction record
                await tx.expense.create({
                    data: {
                        group_id: exp.group_id,
                        paid_by: exp.paid_by,
                        description: exp.description,
                        amount: exp.amount,
                        currency: exp.currency,
                        category: exp.category,
                        is_recurring: false, // The copy is not recurring
                        is_settlement: exp.is_settlement,
                        splits: {
                            create: exp.splits.map(s => ({
                                user_id: s.user_id,
                                share: s.share,
                            })),
                        },
                    },
                });

                // Update the template with the next date
                const nextDate = calculateNextDate(exp.next_occurrence, exp.frequency);
                await tx.expense.update({
                    where: { expense_id: exp.expense_id },
                    data: { next_occurrence: nextDate },
                });
            });

            console.log(`Successfully processed recurring expense: ${exp.description}`);
        }
    } catch (error) {
        console.error("❌ Error processing recurring expenses:", error);
    }
};

/**
 * Initialize the cron job to run every day at midnight (00:00)
 */
export const initCronJobs = () => {
    // Run every day at 00:00
    cron.schedule("0 0 * * *", () => {
        processRecurringExpenses();
    });

    // Also run once on startup to catch up if server was down
    processRecurringExpenses();

    console.log("⏰ Cron jobs initialized: Checking for recurring expenses daily at 00:00.");
};

export default initCronJobs;
