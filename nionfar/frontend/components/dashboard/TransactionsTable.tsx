import React from 'react';
import { Transaction } from '../../types';
import { FiArrowUp, FiArrowDown, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface TransactionsTableProps {
  transactions: Transaction[];
  onPageChange: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onPageChange,
  currentPage,
  totalPages
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FiArrowDown className="h-5 w-5 text-green-500" />;
      case 'withdrawal':
        return <FiArrowUp className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      {/* Table pour desktop */}
      <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getTypeIcon(transaction.type)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transaction.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm ${transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.type === 'withdrawal' ? '-' : '+'} {formatAmount(transaction.amount)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status === 'completed' && <FiCheckCircle className="mr-1 h-4 w-4" />}
                  {transaction.status === 'pending' && <FiClock className="mr-1 h-4 w-4" />}
                  {transaction.status === 'failed' && <FiXCircle className="mr-1 h-4 w-4" />}
                  {transaction.status === 'completed' && 'Complété'}
                  {transaction.status === 'pending' && 'En attente'}
                  {transaction.status === 'failed' && 'Échoué'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Liste pour mobile */}
      <div className="sm:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                {getTypeIcon(transaction.type)}
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {transaction.type === 'order' ? 'Commande' : 'Retrait'}
                </span>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status === 'completed' && <FiCheckCircle className="mr-1 h-4 w-4" />}
                {transaction.status === 'pending' && <FiClock className="mr-1 h-4 w-4" />}
                {transaction.status === 'failed' && <FiXCircle className="mr-1 h-4 w-4" />}
                {transaction.status === 'completed' && 'Complété'}
                {transaction.status === 'pending' && 'En attente'}
                {transaction.status === 'failed' && 'Échoué'}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">{transaction.description}</div>
            <div className="flex justify-between items-center">
              <div className={`text-sm font-medium ${transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.type === 'withdrawal' ? '-' : '+'} {formatAmount(transaction.amount)}
              </div>
              <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Précédent
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> sur{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Précédent</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Suivant</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable; 