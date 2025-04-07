import React from 'react';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr/index.js';

export interface RevenueData {
  date: string | Date;
  amount: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMM', { locale: fr });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Trouver les valeurs min et max pour l'échelle
  const amounts = data.map(item => item.amount);
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);
  const range = maxAmount - minAmount || 1; // Éviter la division par zéro

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des revenus</h3>
      <div className="h-60 sm:h-80 relative overflow-x-auto">
        <div className="min-w-[500px] h-full relative">
          {/* Axe Y */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
            <div>{formatAmount(maxAmount)}</div>
            <div>{formatAmount(minAmount + range / 2)}</div>
            <div>{formatAmount(minAmount)}</div>
          </div>
          
          {/* Graphique */}
          <div className="ml-16 h-full flex items-end">
            {data.map((item, index) => {
              const height = ((item.amount - minAmount) / range) * 100;
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center"
                  style={{ height: '100%' }}
                >
                  <div 
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ 
                      height: `${height}%`,
                      opacity: 0.8
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {formatDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart; 