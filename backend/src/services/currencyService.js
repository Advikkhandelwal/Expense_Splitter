/**
 * Currency Service
 * Handles exchange rates and currency conversions.
 * Currently uses hardcoded rates, but can be updated to use an external API like ExchangeRate-API or Fixer.
 */

const EXCHANGE_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    CAD: 1.35,
    AUD: 1.52,
    JPY: 148.5,
};

/**
 * Convert an amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'USD')
 * @param {string} toCurrency - Target currency code (e.g., 'EUR')
 * @returns {number} - The converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = EXCHANGE_RATES[fromCurrency] || 1.0;
    const toRate = EXCHANGE_RATES[toCurrency] || 1.0;

    // Convert to USD first (base), then to target
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
};

/**
 * Get available currencies
 * @returns {string[]} - List of currency codes
 */
export const getAvailableCurrencies = () => {
    return Object.keys(EXCHANGE_RATES);
};

export default {
    convertCurrency,
    getAvailableCurrencies,
};
