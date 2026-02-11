import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Badge } from '../components/ui';
import Analytics from '../components/Analytics';
import SettlementModal from '../components/SettlementModal';
import InvitationModal from '../components/InvitationModal';
import Toast from '../components/ui/Toast';
import {
  Plus,
  Settings,
  Trash2,
  Receipt,
  BarChart3,
  Wallet,
  ArrowRightLeft,
  UserPlus,
  Download,
  FileText,
  Repeat
} from 'lucide-react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, expenses, balances, fetchGroup, deleteExpense, loading } = useStore();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchGroup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !currentGroup) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalSpent = expenses
    .filter(e => !e.is_settlement)
    .reduce((sum, e) => {
      // Convert exp amount to group currency for total calculation
      const amount = parseFloat(e.amount);
      if (e.currency && e.currency !== currentGroup.currency) {
        // Simple frontend-only conversion for display
        const rates = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.12, CAD: 1.35, AUD: 1.52, JPY: 148.5 };
        const conv = (amount / (rates[e.currency] || 1)) * (rates[currentGroup.currency] || 1);
        return sum + conv;
      }
      return sum + amount;
    }, 0);

  const getCurrencySymbol = (code) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$', JPY: '¥' };
    return symbols[code] || '$';
  };

  const getCategoryIcon = (category) => {
    const icons = { Food: '🍔', Travel: '✈️', Entertainment: '🎬', Transport: '🚗', Utilities: '💡', Shopping: '🛍️', Other: '🧾' };
    return icons[category] || '🧾';
  };

  const exportToCSV = () => {
    const data = expenses.map(e => ({
      Date: new Date(e.created_at).toLocaleDateString(),
      Description: e.description,
      Category: e.category || 'Other',
      Amount: e.amount,
      Currency: e.currency || 'USD',
      'Paid By': e.paid_by_name,
      Type: e.is_settlement ? 'Settlement' : 'Expense'
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${currentGroup.name}_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`${currentGroup.name} - Expense Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = expenses.map(e => [
      new Date(e.created_at).toLocaleDateString(),
      e.description,
      e.category || 'Other',
      `${getCurrencySymbol(e.currency || 'USD')}${parseFloat(e.amount).toFixed(2)}`,
      e.paid_by_name
    ]);

    doc.autoTable({
      head: [['Date', 'Description', 'Category', 'Amount', 'Paid By']],
      body: tableData,
      startY: 30,
    });

    doc.save(`${currentGroup.name}_report.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentGroup.name}</h1>
          <p className="text-gray-500">{currentGroup.description || 'No description'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/groups/${id}/manage`)}>
            <Settings size={18} className="mr-2" />
            Manage
          </Button>
          <Button variant="secondary" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus size={18} className="mr-2" />
            Invite
          </Button>
          <Button onClick={() => navigate(`/groups/${id}/add-expense`)}>
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <p className="text-indigo-100 font-medium mb-1">Total Expenses ({currentGroup.currency})</p>
          <h3 className="text-3xl font-bold">{getCurrencySymbol(currentGroup.currency)}{totalSpent.toFixed(2)}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 font-medium mb-1">Members</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{currentGroup.members.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 font-medium mb-1">Your Balance ({currentGroup.currency})</p>
          <h3 className={`text-3xl font-bold ${balances[useStore.getState().user?.user_id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balances[useStore.getState().user?.user_id] >= 0 ? '+' : ''}
            {getCurrencySymbol(currentGroup.currency)}{(balances[useStore.getState().user?.user_id] || 0).toFixed(2)}
          </h3>
        </Card>
      </div>

      {/* Tabs & Export Buttons */}
      <div className="border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-8">
          {[
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'balances', label: 'Balances', icon: Wallet },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors relative ${activeTab === tab.id
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2 pb-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
            title="Export to CSV"
          >
            <Download size={14} />
            CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
            title="Export to PDF"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No expenses yet. Add one to get started!
              </div>
            ) : (
              expenses.map(expense => (
                <Card key={expense.expense_id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${expense.is_settlement ? 'bg-green-50 text-green-600' : 'bg-gray-50'
                      }`}>
                      {expense.is_settlement ? '🤝' : getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{expense.description}</h4>
                        {expense.is_recurring && (
                          <div className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <Repeat size={10} />
                            {expense.frequency}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {expense.is_settlement ? 'Settlement' : `Paid by ${expense.paid_by_name}`} • {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className={`font-bold text-lg ${expense.is_settlement ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                        {getCurrencySymbol(expense.currency || (expense.is_settlement ? currentGroup.currency : 'USD'))}{parseFloat(expense.amount).toFixed(2)}
                      </p>
                      {!expense.is_settlement && (
                        <p className="text-xs text-gray-400">
                          {expense.category || 'Other'} • Split {expense.splits?.length || 0} people
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.expense_id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Net Balances</h3>
              <Button onClick={() => setIsSettlementModalOpen(true)} className="gap-2">
                <ArrowRightLeft size={18} />
                Settle Up
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.members.map(member => {
                const balance = balances[member.user_id] || 0;
                return (
                  <Card key={member.user_id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                    </div>
                    <Badge variant={balance > 0 ? 'success' : balance < 0 ? 'danger' : 'default'}>
                      {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'} {getCurrencySymbol(currentGroup.currency)}{Math.abs(balance).toFixed(2)}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Analytics expenses={expenses} members={currentGroup.members} />
        )}
      </div>

      <SettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        group={currentGroup}
      />

      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        group={currentGroup}
        onSuccess={(email) => setToast({ message: `Invitation sent successfully to ${email}!`, type: 'success' })}
        onError={(message) => setToast({ message, type: 'error' })}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}