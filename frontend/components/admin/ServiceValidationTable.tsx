import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiRotateCw, FiCheckCircle, FiAlertTriangle, FiEdit, FiEye } from 'react-icons/fi/index.js';
import { HiOutlineDocumentReport } from 'react-icons/hi/index.js';
import { Service } from '../../types';

// Type pour le statut de service
export type ServiceStatus = 'validated' | 'validated_prod' | 'rejected' | 'pending' | 'revision';

// Type pour le résultat de validation
export interface ValidationResult {
  status: ServiceStatus;
  score: number;
  report: string;
  detailedReport: string | { category: string; passed: boolean; score: number; message: string; }[];
  moderatedByBot: boolean;
  revisionFeedback?: string;
}

interface ServiceValidationTableProps {
  services: Service[];
  validationResults: Record<string, ValidationResult>;
  isLoading: boolean;
  onRunValidation: (serviceId: string) => void;
  onUpdateStatus: (serviceId: string, status: ServiceStatus) => void;
  onSendRevision: (serviceId: string, feedback: string) => void;
  onOpenDetails: (serviceId: string) => void;
  onPublishToProd: (serviceId: string) => void;
  isAnalyzing: string | null;
  selectedServiceId: string | null;
}

const ServiceValidationTable: React.FC<ServiceValidationTableProps> = ({
  services,
  validationResults,
  isLoading,
  onRunValidation,
  onUpdateStatus,
  onSendRevision,
  onOpenDetails,
  onPublishToProd,
  isAnalyzing,
  selectedServiceId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calcul des services à afficher sur la page actuelle
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Tri des services
  const sortedServices = [...services].sort((a, b) => {
    let valueA, valueB;

    if (sortField === 'score') {
      valueA = validationResults[a.id]?.score || 0;
      valueB = validationResults[b.id]?.score || 0;
    } else if (sortField === 'status') {
      valueA = validationResults[a.id]?.status || 'pending';
      valueB = validationResults[b.id]?.status || 'pending';
    } else if (sortField === 'price') {
      valueA = a.price || 0;
      valueB = b.price || 0;
    } else if (sortField === 'createdAt') {
      valueA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valueB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    } else {
      valueA = a[sortField as keyof Service] || '';
      valueB = b[sortField as keyof Service] || '';
    }

    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const currentItems = sortedServices.slice(indexOfFirstItem, indexOfLastItem);

  // Gestion du changement de page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Gestion du changement de tri
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Style pour les badges de statut
  const getStatusBadgeStyle = (status: ServiceStatus) => {
    switch (status) {
      case 'validated_prod':
        return 'bg-emerald-100 text-emerald-800';
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Texte pour les badges de statut
  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'validated_prod':
        return 'En production';
      case 'validated':
        return 'Validé';
      case 'rejected':
        return 'Rejeté';
      case 'revision':
        return 'En révision';
      default:
        return 'En attente';
    }
  };

  // Style pour les badges de score
  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Service
                  {sortField === 'title' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Prix
                  {sortField === 'price' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('provider.name')}
                >
                  Prestataire
                  {sortField === 'provider.name' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')}
                >
                  Date
                  {sortField === 'createdAt' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  Statut
                  {sortField === 'status' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('score')}
                >
                  Score
                  {sortField === 'score' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((service) => {
                  const result = validationResults[service.id] || {
                    status: 'pending',
                    score: 0,
                    moderatedByBot: false
                  };

                  return (
                    <tr 
                      key={service.id} 
                      className={`${selectedServiceId === service.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={service.image || service.images?.[0] || '/images/placeholder.jpg'}
                              alt={service.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {service.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {service.category ? (typeof service.category === 'string' ? service.category : service.category.name) : 'Non catégorisé'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(service.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <img
                              className="h-8 w-8 rounded-full"
                              src={service.provider?.avatar || '/images/default-avatar.png'}
                              alt={service.provider?.name}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {service.provider?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.createdAt ? formatDate(service.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(result.status)}`}>
                          {getStatusText(result.status)}
                        </span>
                        {result.moderatedByBot && (
                          <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Auto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${getScoreBadgeStyle(result.score).replace('text-', 'bg-').replace('-100', '-500')}`}
                              style={{ width: `${result.score}%` }}
                            ></div>
                          </div>
                          <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-none font-semibold rounded-full ${getScoreBadgeStyle(result.score)}`}>
                            {result.score}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onOpenDetails(service.id)}
                            className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 tooltip"
                            title="Voir les détails complets"
                          >
                            <HiOutlineDocumentReport size={18} />
                          </button>
                          <button
                            onClick={() => onRunValidation(service.id)}
                            className="p-1.5 bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 tooltip"
                            title="Analyser le service"
                            disabled={isAnalyzing === service.id}
                          >
                            {isAnalyzing === service.id ? (
                              <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
                            ) : (
                              <FiRotateCw size={18} />
                            )}
                          </button>
                          {result.status !== 'validated_prod' && (
                            <button
                              onClick={() => onUpdateStatus(service.id, 'validated')}
                              className="p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 tooltip"
                              title="Valider (hors ligne)"
                            >
                              <FiCheck size={18} />
                            </button>
                          )}
                          {result.status === 'validated' && (
                            <button
                              onClick={() => onPublishToProd(service.id)}
                              className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200 tooltip"
                              title="Mettre en production"
                            >
                              <FiCheckCircle size={18} />
                            </button>
                          )}
                          {result.status !== 'rejected' && (
                            <button
                              onClick={() => onUpdateStatus(service.id, 'rejected')}
                              className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 tooltip"
                              title="Rejeter"
                            >
                              <FiX size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun service à valider
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {services.length > itemsPerPage && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, services.length)}
                    </span>{' '}
                    sur <span className="font-medium">{services.length}</span> services
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      &laquo;
                    </button>
                    {Array.from({ length: Math.ceil(services.length / itemsPerPage) }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === i + 1
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === Math.ceil(services.length / itemsPerPage)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === Math.ceil(services.length / itemsPerPage)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      &raquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ServiceValidationTable; 