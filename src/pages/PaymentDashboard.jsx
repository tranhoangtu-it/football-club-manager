import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { paymentsAPI, membersAPI, utils } from '../services/googleSheetsService';
import { CreditCard, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const PaymentDashboard = () => {
  const { state, dispatch } = useApp();
  const [currentMonth, setCurrentMonth] = useState(utils.getCurrentMonthYear());
  const [dueDay, setDueDay] = useState(15);

  useEffect(() => {
    loadPayments();
  }, [currentMonth]);

  const loadPayments = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const [payments, members] = await Promise.all([
        paymentsAPI.getAllPayments(),
        membersAPI.getAllMembers()
      ]);
      
      dispatch({ type: 'SET_PAYMENTS', payload: payments });
      dispatch({ type: 'SET_MEMBERS', payload: members });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleMarkLatePayments = async () => {
    try {
      await paymentsAPI.markLatePayments(dueDay);
      loadPayments(); // Reload to get updated data
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await paymentsAPI.updatePaymentStatus(paymentId, newStatus);
      dispatch({ 
        type: 'UPDATE_PAYMENT_STATUS', 
        payload: { paymentId, status: newStatus } 
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const getMemberName = (memberId) => {
    const member = state.members.find(m => m.memberId === memberId);
    return member ? member.name : 'Unknown Member';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Unpaid':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Late':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      case 'Late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentMonthPayments = state.payments.filter(p => p.monthYear === currentMonth);
  const paidCount = currentMonthPayments.filter(p => p.status === 'Paid').length;
  const unpaidCount = currentMonthPayments.filter(p => p.status === 'Unpaid').length;
  const lateCount = currentMonthPayments.filter(p => p.status === 'Late').length;
  const totalAmount = currentMonthPayments.reduce((sum, p) => sum + parseInt(p.amount || 0), 0);
  const paidAmount = currentMonthPayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + parseInt(p.amount || 0), 0);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage member payments and financial tracking</p>
        </div>
        <div className="flex space-x-3">
          <input
            type="number"
            value={dueDay}
            onChange={(e) => setDueDay(parseInt(e.target.value))}
            min="1"
            max="31"
            className="input w-20"
            placeholder="Due day"
          />
          <button
            onClick={handleMarkLatePayments}
            className="btn btn-warning"
          >
            Mark Late Payments
          </button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-semibold text-gray-900">{paidCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-semibold text-gray-900">{unpaidCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Late</p>
                <p className="text-2xl font-semibold text-gray-900">{lateCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">${totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Month:</label>
            <input
              type="month"
              value={currentMonth.replace('-', '-').padStart(7, '0')}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setCurrentMonth(`${month}-${year}`);
              }}
              className="input w-40"
            />
            <div className="text-sm text-gray-500">
              Showing payments for {currentMonth}
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentMonthPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No payments found for {currentMonth}
                  </td>
                </tr>
              ) : (
                currentMonthPayments.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-gray-50">
                    <td>
                      <div className="text-sm font-medium text-gray-900">
                        {getMemberName(payment.memberId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {payment.memberId}
                      </div>
                    </td>
                    <td className="text-sm font-medium text-gray-900">
                      ${parseInt(payment.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-900">
                      {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        {payment.status === 'Unpaid' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(payment.paymentId, 'Paid')}
                            className="btn btn-success text-xs"
                          >
                            Mark Paid
                          </button>
                        )}
                        {payment.status === 'Paid' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(payment.paymentId, 'Unpaid')}
                            className="btn btn-warning text-xs"
                          >
                            Mark Unpaid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
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

export default PaymentDashboard;

