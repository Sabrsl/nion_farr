import React, { useState } from 'react';
import { 
  FiFileText, 
  FiDownload, 
  FiCalendar, 
  FiCheckCircle,
  FiX,
  FiLoader
} from 'react-icons/fi/index.js';
import Modal from '../ui/Modal';

interface FinancialReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: ReportOptions) => Promise<void>;
}

export interface ReportOptions {
  reportType: string;
  period: string;
  startDate?: string;
  endDate?: string;
  includeDetails: boolean;
  format: string;
  groupBy?: string;
}

const FinancialReportGenerator: React.FC<FinancialReportGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [options, setOptions] = useState<ReportOptions>({
    reportType: 'transactions',
    period: 'month',
    includeDetails: true,
    format: 'pdf',
    groupBy: 'day'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (name: string, value: string | boolean) => {
    setOptions({
      ...options,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await onGenerate(options);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la génération du rapport');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setOptions({
      reportType: 'transactions',
      period: 'month',
      includeDetails: true,
      format: 'pdf',
      groupBy: 'day'
    });
    setSuccess(false);
    setError(null);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Générer un rapport financier"
      size="md"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Génération en cours</h3>
          <p className="text-sm text-gray-500 text-center">
            Nous générons votre rapport financier...<br />
            Cela peut prendre quelques instants.
          </p>
        </div>
      ) : success ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-green-100 rounded-full p-2 mb-4">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Rapport généré avec succès</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Votre rapport financier a été généré avec succès.<br />
            Vous pouvez maintenant le télécharger.
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {
              // Simulation de téléchargement
              const link = document.createElement('a');
              link.href = '#';
              link.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.${options.format}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <FiDownload className="mr-2 h-5 w-5" />
            Télécharger le rapport
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiX className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Type de rapport */}
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de rapport
              </label>
              <select
                id="reportType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={options.reportType}
                onChange={(e) => handleChange('reportType', e.target.value)}
              >
                <option value="transactions">Journal des transactions</option>
                <option value="revenue">Rapport de revenus</option>
                <option value="payouts">Rapport des paiements</option>
                <option value="refunds">Rapport des remboursements</option>
                <option value="commissions">Rapport des commissions</option>
                <option value="summary">Résumé financier</option>
              </select>
            </div>
            
            {/* Période */}
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                Période
              </label>
              <select
                id="period"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={options.period}
                onChange={(e) => handleChange('period', e.target.value)}
              >
                <option value="day">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
                <option value="custom">Période personnalisée</option>
              </select>
            </div>
            
            {/* Dates personnalisées */}
            {options.period === 'custom' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={options.startDate || ''}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required={options.period === 'custom'}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={options.endDate || ''}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      required={options.period === 'custom'}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Groupement */}
            {(options.reportType === 'revenue' || options.reportType === 'summary') && (
              <div>
                <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">
                  Regrouper par
                </label>
                <select
                  id="groupBy"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={options.groupBy}
                  onChange={(e) => handleChange('groupBy', e.target.value)}
                >
                  <option value="day">Jour</option>
                  <option value="week">Semaine</option>
                  <option value="month">Mois</option>
                  <option value="type">Type de transaction</option>
                  <option value="user_type">Type d'utilisateur</option>
                </select>
              </div>
            )}
            
            {/* Format */}
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                Format du rapport
              </label>
              <select
                id="format"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={options.format}
                onChange={(e) => handleChange('format', e.target.value)}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            </div>
            
            {/* Options supplémentaires */}
            <div className="flex items-center">
              <input
                id="includeDetails"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={options.includeDetails}
                onChange={(e) => handleChange('includeDetails', e.target.checked)}
              />
              <label htmlFor="includeDetails" className="ml-2 block text-sm text-gray-900">
                Inclure les détails des transactions
              </label>
            </div>
          </div>
          
          <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiFileText className="mr-2 -ml-1 h-4 w-4" />
              Générer le rapport
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default FinancialReportGenerator; 