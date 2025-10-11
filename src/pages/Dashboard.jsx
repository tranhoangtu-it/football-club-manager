import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { membersAPI, paymentsAPI, matchesAPI } from '../services/googleSheetsService';
import { Users, CreditCard, Trophy, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [members, payments, matches] = await Promise.all([
        membersAPI.getAllMembers(),
        paymentsAPI.getCurrentMonthPayments(),
        matchesAPI.getAllMatches()
      ]);

      dispatch({ type: 'SET_MEMBERS', payload: members });
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
      dispatch({ type: 'SET_MATCHES', payload: matches });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const stats = [
    {
      name: 'Total Members',
      value: state.members.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Paid This Month',
      value: state.payments.filter(p => p.status === 'Paid').length,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Unpaid Members',
      value: state.payments.filter(p => p.status === 'Unpaid').length,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Total Matches',
      value: state.matches.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentPayments = state.payments
    .filter(p => p.status === 'Unpaid' || p.status === 'Late')
    .slice(0, 5);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your football club management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid Payments */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Unpaid Payments</h3>
          </div>
          <div className="card-body">
            {recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All payments are up to date!</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.paymentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {state.members.find(m => m.memberId === payment.memberId)?.name || 'Unknown Member'}
                      </p>
                      <p className="text-sm text-gray-500">{payment.monthYear}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${payment.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'Late' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <button className="w-full btn btn-primary text-left">
                <Users className="inline w-4 h-4 mr-2" />
                Add New Member
              </button>
              <button className="w-full btn btn-secondary text-left">
                <CreditCard className="inline w-4 h-4 mr-2" />
                Record Payment
              </button>
              <button className="w-full btn btn-secondary text-left">
                <Calendar className="inline w-4 h-4 mr-2" />
                Add Match
              </button>
              <button className="w-full btn btn-warning text-left">
                <AlertCircle className="inline w-4 h-4 mr-2" />
                Mark Late Payments
              </button>
            </div>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

