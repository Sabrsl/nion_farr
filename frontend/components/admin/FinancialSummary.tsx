import React from 'react';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCreditCard,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiAlertTriangle
} from 'react-icons/fi/index.js';

interface FinancialSummaryProps {
  data: {
    totalRevenue: number;
    pendingPayouts: number;
    commissions: number;
    growth: number;
    totalTransactions?: number;
    averageTransactionValue?: number;
    failedTransactions?: number;
    pendingTransactions?: number;
  };
  formatPrice: (amount: number) => string;
  period?: string;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  data,
  formatPrice,
  period = 'Ce mois'
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Résumé financier - <span className="text-indigo-600">{period}</span></h2>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Revenus totaux */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <FiDollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenus totaux</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{formatPrice(data.totalRevenue)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <div className="text-sm">
              <span className={`font-medium ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'} inline-flex items-center`}>
                {data.growth >= 0 ? (
                  <FiTrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <FiTrendingDown className="mr-1 h-4 w-4" />
                )}
                {data.growth >= 0 ? '+' : ''}{data.growth}%
              </span>
              <span className="text-gray-500 ml-2">vs période précédente</span>
            </div>
          </div>
        </div>
        
        {/* Commissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FiCreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Commissions</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{formatPrice(data.commissions)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-gray-500">
                {(data.commissions / data.totalRevenue * 100).toFixed(1)}% des revenus
              </span>
            </div>
          </div>
        </div>
        
        {/* Paiements en attente */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <FiTrendingDown className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Paiements en attente</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{formatPrice(data.pendingPayouts)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              {data.pendingTransactions && (
                <span className="text-gray-500">
                  {data.pendingTransactions} transaction{data.pendingTransactions > 1 ? 's' : ''} en attente
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Valeur moyenne des transactions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FiBarChart2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Valeur moyenne</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {data.averageTransactionValue 
                        ? formatPrice(data.averageTransactionValue) 
                        : formatPrice(data.totalRevenue / (data.totalTransactions || 1))}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-2">
            <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-gray-500">
                {data.totalTransactions} transaction{data.totalTransactions !== 1 ? 's' : ''} au total
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Informations supplémentaires */}
      {data.failedTransactions && data.failedTransactions > 0 && (
        <div className="mt-5 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex flex-wrap items-center">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <span className="font-medium">Attention:</span> {data.failedTransactions} transaction{data.failedTransactions > 1 ? 's' : ''} en échec nécessite{data.failedTransactions > 1 ? 'nt' : ''} votre attention.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary; 