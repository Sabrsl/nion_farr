import React from 'react';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiDollarSign, FiUser, FiRefreshCcw } from 'react-icons/fi/index.js';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  date: string;
  description: string;
  meta?: Record<string, any>;
  reference?: string;
}

interface RefundTransactionHistoryProps {
  orderId: number;
  transactions: Transaction[];
  formatPrice: (amount: number) => string;
}

const RefundTransactionHistory: React.FC<RefundTransactionHistoryProps> = ({ 
  orderId, 
  transactions, 
  formatPrice 
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <FiDollarSign className="h-5 w-5 text-green-500" />;
      case 'refund':
        return <FiRefreshCcw className="h-5 w-5 text-red-500" />;
      case 'fee':
        return <FiDollarSign className="h-5 w-5 text-gray-500" />;
      default:
        return <FiDollarSign className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <FiClock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <FiAlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">
          Historique des transactions - Commande #{orderId}
        </h3>
      </div>
      
      {transactions.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          Aucune transaction trouvée pour cette commande
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-1">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.type === 'payment' 
                        ? 'Paiement initial' 
                        : transaction.type === 'refund' 
                          ? 'Remboursement' 
                          : transaction.type}
                    </p>
                    <div className="flex items-center">
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 text-xs text-gray-500">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {transaction.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      <FiDollarSign className="mr-1 h-3 w-3" />
                      {formatPrice(transaction.amount)}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                      <FiClock className="mr-1 h-3 w-3" />
                      {formatDate(transaction.date)}
                    </span>
                    {transaction.reference && (
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                        Réf: {transaction.reference}
                      </span>
                    )}
                  </div>
                  
                  {transaction.meta && Object.keys(transaction.meta).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div className="font-semibold mb-1">Informations supplémentaires:</div>
                      <ul className="space-y-1">
                        {Object.entries(transaction.meta).map(([key, value]) => (
                          <li key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundTransactionHistory; 