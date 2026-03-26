import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const transactionData = location.state;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction Successful!</h1>
          <p className="text-gray-600 mb-6">Your gold purchase has been confirmed.</p>
          
          {transactionData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>₹{transactionData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gold Quantity:</span>
                  <span>{transactionData.goldQuantity}g</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>₹{transactionData.goldRate}/g</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/portfolio')}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Portfolio
            </button>
            <button
              onClick={() => navigate('/buy-gold')}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Buy More Gold
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;