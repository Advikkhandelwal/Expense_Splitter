import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui';
import { Plus, TrendingUp, TrendingDown, Clock, Users, DollarSign, ArrowRight } from 'lucide-react';
import DebtDetailsModal from '../components/DebtDetailsModal';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { user, groups, fetchGroups, loading } = useStore();
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [balances, setBalances] = useState({ youOwe: 0, youAreOwed: 0 });
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [debtsYouOwe, setDebtsYouOwe] = useState([]);
  const [debtsYouAreOwed, setDebtsYouAreOwed] = useState([]);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtModalType, setDebtModalType] = useState(null);

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchActivity();
      calculateBalances();
    }
  }, [user]);

  const fetchActivity = async () => {
    try {
      setLoadingActivity(true);
      const res = await axios.get(`${API_URL}/users/${user.user_id}/activity`);
      setActivity(res.data.slice(0, 10)); // Show latest 10 activities
    } catch (err) {
      console.error('Failed to fetch activity', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const calculateBalances = async () => {
    try {
      // Fetch all groups with members and expenses
      const groupDetailsPromises = groups.map(async (g) => {
        const [expensesRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/groups/${g.group_id}/expenses`),
          axios.get(`${API_URL}/groups/${g.group_id}`)
        ]);
        return {
          group: groupRes.data,
          expenses: expensesRes.data
        };
      });

      const allGroupData = await Promise.all(groupDetailsPromises);

      // Create a map to store debts per person
      const youOweMap = {}; // { userId: { name, amount, groupName, count } }
      const youAreOwedMap = {}; // { userId: { name, amount, groupName, count } }

      let totalOwed = 0;
      let totalOwing = 0;

      allGroupData.forEach(({ group, expenses }) => {
        // Create a map of user_id to user name for this group
        const userMap = {};
        group.members?.forEach(member => {
          userMap[member.user_id] = member.user?.name || member.name || 'Unknown';
        });

        expenses.forEach(expense => {
          const userSplit = expense.splits?.find(s => s.user_id === user.user_id);
          if (!userSplit) return;

          const splitAmount = parseFloat(userSplit.share);
          const expenseAmount = parseFloat(expense.amount);

          if (expense.paid_by === user.user_id) {
            // User paid, others owe them
            const amountOwed = expenseAmount - splitAmount;
            totalOwed += amountOwed;

            // Track who owes the user
            expense.splits.forEach(split => {
              if (split.user_id !== user.user_id) {
                const userId = split.user_id;
                const userName = userMap[userId] || 'Unknown';
                if (!youAreOwedMap[userId]) {
                  youAreOwedMap[userId] = {
                    name: userName,
                    amount: 0,
                    groupName: group.name,
                    count: 0
                  };
                }
                youAreOwedMap[userId].amount += parseFloat(split.share);
                youAreOwedMap[userId].count += 1;
              }
            });
          } else {
            // Someone else paid, user owes them
            totalOwing += splitAmount;

            const payerId = expense.paid_by;
            const payerName = userMap[payerId] || 'Unknown';
            if (!youOweMap[payerId]) {
              youOweMap[payerId] = {
                name: payerName,
                amount: 0,
                groupName: group.name,
                count: 0
              };
            }
            youOweMap[payerId].amount += splitAmount;
            youOweMap[payerId].count += 1;
          }
        });
      });

      // Convert maps to arrays and sort by amount
      const youOweList = Object.values(youOweMap)
        .sort((a, b) => b.amount - a.amount);
      const youAreOwedList = Object.values(youAreOwedMap)
        .sort((a, b) => b.amount - a.amount);

      setDebtsYouOwe(youOweList);
      setDebtsYouAreOwed(youAreOwedList);
      setBalances({ youOwe: totalOwing, youAreOwed: totalOwed });
    } catch (err) {
      console.error('Failed to calculate balances', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (groups.length === 0) {
                alert("Please create a group first.");
              } else if (groups.length === 1) {
                navigate(`/groups/${groups[0].group_id}/add-expense`);
              } else {
                alert("Please select a group from the list below to add an expense.");
                // Optionally scroll to groups section
                document.getElementById('groups-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="gap-2"
            variant="secondary"
          >
            <Plus size={20} />
            Quick Add Expense
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-100 dark:border-red-800/50 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => {
            setDebtModalType('owe');
            setIsDebtModalOpen(true);
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
              You Owe
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(balances.youOwe)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total amount you owe to others</p>
          {debtsYouOwe.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Click to see details ({debtsYouOwe.length} {debtsYouOwe.length === 1 ? 'person' : 'people'})
            </p>
          )}
        </Card>

        <Card
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/50 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => {
            setDebtModalType('owed');
            setIsDebtModalOpen(true);
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
              You Are Owed
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(balances.youAreOwed)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total amount others owe you</p>
          {debtsYouAreOwed.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Click to see details ({debtsYouAreOwed.length} {debtsYouAreOwed.length === 1 ? 'person' : 'people'})
            </p>
          )}
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Clock size={20} />
                Recent Activity
              </h2>
            </div>

            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.flow === 'out'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                      <DollarSign size={20} className={
                        item.flow === 'out'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.group} • {item.details}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.flow === 'out'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                        }`}>
                        {item.flow === 'out' ? '-' : '+'}{formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Group Summaries */}
        <div>
          <Card className="p-6" id="groups-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users size={20} />
                Your Groups
              </h2>
              <button
                onClick={() => navigate('/groups')}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="mb-4">No groups yet</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/groups')}
                >
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map(group => (
                  <div
                    key={group.group_id}
                    onClick={() => navigate(`/groups/${group.group_id}`)}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-lg flex items-center justify-center text-primary dark:text-primary-light font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{group.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Debt Details Modal */}
      <DebtDetailsModal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        type={debtModalType}
        debts={debtModalType === 'owe' ? debtsYouOwe : debtsYouAreOwed}
        totalAmount={debtModalType === 'owe' ? balances.youOwe : balances.youAreOwed}
      />
    </div>
  );
}