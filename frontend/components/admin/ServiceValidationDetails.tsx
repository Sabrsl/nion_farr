import React, { useState } from 'react';
import { FiCheck, FiX, FiRotateCw, FiCheckCircle, FiMessageSquare, FiUser, FiAlertTriangle, FiDollarSign, FiCalendar, FiTag, FiBarChart2 } from 'react-icons/fi/index.js';
import { Service } from '../../types';
import { ValidationResult, ServiceStatus } from './ServiceValidationTable';
import ReactMarkdown from 'react-markdown';

interface ServiceValidationDetailsProps {
  service: Service | null;
  validationResult: ValidationResult | null;
  isAnalyzing: boolean;
  isLoading?: boolean;
  onRunValidation: (serviceId: string) => void;
  onUpdateStatus: (serviceId: string, status: ServiceStatus) => void;
  onSendRevision: (serviceId: string, feedback: string) => void;
  onPublishToProd: (serviceId: string) => void;
}

const ServiceValidationDetails: React.FC<ServiceValidationDetailsProps> = ({
  service,
  validationResult,
  isAnalyzing,
  isLoading = false,
  onRunValidation,
  onUpdateStatus,
  onSendRevision,
  onPublishToProd
}) => {
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isRevisionMode, setIsRevisionMode] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-500">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
        <p className="text-gray-500">Veuillez sélectionner un service pour voir les détails</p>
      </div>
    );
  }

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Style pour les badges de score
  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Text pour les statuts
  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'validated_prod':
        return 'En production (en ligne)';
      case 'validated':
        return 'Validé (hors ligne)';
      case 'rejected':
        return 'Rejeté';
      case 'revision':
        return 'En révision';
      default:
        return 'En attente';
    }
  };

  const handleSendRevision = () => {
    if (service && revisionFeedback.trim()) {
      onSendRevision(service.id, revisionFeedback);
      setRevisionFeedback('');
      setIsRevisionMode(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{service.title}</h2>
          <div className="flex space-x-2">
            {validationResult && (
              <>
                {validationResult.status !== 'validated_prod' && (
                  <button
                    onClick={() => onUpdateStatus(service.id, 'validated')}
                    className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    <FiCheck className="mr-1" /> Valider
                  </button>
                )}
                {validationResult.status === 'validated' && (
                  <button
                    onClick={() => onPublishToProd(service.id)}
                    className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200"
                  >
                    <FiCheckCircle className="mr-1" /> Mettre en production
                  </button>
                )}
                {validationResult.status !== 'rejected' && (
                  <button
                    onClick={() => onUpdateStatus(service.id, 'rejected')}
                    className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  >
                    <FiX className="mr-1" /> Rejeter
                  </button>
                )}
                {!isRevisionMode && validationResult.status !== 'revision' && (
                  <button
                    onClick={() => setIsRevisionMode(true)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    <FiMessageSquare className="mr-1" /> Demander une révision
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <FiUser className="mr-2" />
              <span className="font-medium">Prestataire:</span>
              <span className="ml-2">{service.provider?.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiDollarSign className="mr-2" />
              <span className="font-medium">Prix:</span>
              <span className="ml-2">{formatPrice(service.price)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiCalendar className="mr-2" />
              <span className="font-medium">Créé le:</span>
              <span className="ml-2">{service.createdAt ? formatDate(service.createdAt) : 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <FiTag className="mr-2" />
              <span className="font-medium">Catégorie:</span>
              <span className="ml-2">
                {service.category
                  ? typeof service.category === 'string'
                    ? service.category
                    : service.category.name
                  : 'Non catégorisé'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {service.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            {validationResult && (
              <>
                <div className="flex items-center mb-2">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${getStatusBadgeStyle(validationResult.status)}`}
                  ></div>
                  <h3 className="text-lg font-medium">
                    Statut: {getStatusText(validationResult.status)}
                  </h3>
                </div>
                <div className="flex items-center mb-2">
                  <FiBarChart2 className="mr-2 text-gray-600" />
                  <span className="font-medium">Score de qualité:</span>
                  <div className="flex items-center ml-2">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full w-32">
                      <div
                        className={`h-2 rounded-full ${getScoreBadgeStyle(validationResult.score)}`}
                        style={{ width: `${validationResult.score}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 font-medium">{validationResult.score}/100</span>
                  </div>
                </div>
                <button
                  onClick={() => onRunValidation(service.id)}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <FiRotateCw className="mr-1" /> Analyser à nouveau
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode révision */}
        {isRevisionMode && (
          <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-medium mb-2 text-blue-800">
              Demande de révision
            </h3>
            <p className="text-sm text-blue-600 mb-3">
              Indiquez au prestataire les modifications à apporter à son service pour qu'il soit validé.
            </p>
            <textarea
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Ex: Veuillez améliorer la description de votre service en ajoutant plus de détails sur les livrables."
            ></textarea>
            <div className="flex justify-end mt-3 space-x-2">
              <button
                onClick={() => setIsRevisionMode(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSendRevision}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                disabled={revisionFeedback.trim() === ''}
              >
                Envoyer la demande
              </button>
            </div>
          </div>
        )}

        {/* Feedback de révision existant */}
        {validationResult && validationResult.revisionFeedback && (
          <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <h3 className="text-lg font-medium mb-2 text-blue-800">
              Feedback envoyé au prestataire:
            </h3>
            <p className="text-sm text-blue-600">{validationResult.revisionFeedback}</p>
          </div>
        )}

        {/* Description du service */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Description du service</h3>
          <div className="prose max-w-none p-4 bg-gray-50 rounded-lg">
            <ReactMarkdown>{service.description || 'Aucune description fournie'}</ReactMarkdown>
          </div>
        </div>

        {/* Images du service */}
        {(service.images?.length > 0 || service.image) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {service.image && (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {service.images?.map((img, index) => (
                <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={`${service.title} - image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rapport de validation */}
        {validationResult && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Rapport de validation</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {validationResult.moderatedByBot && (
                <div className="flex items-center mb-3 text-gray-500 text-sm">
                  <FiAlertTriangle className="mr-1" />
                  Ce rapport a été généré automatiquement par l'IA
                </div>
              )}
              <div className="prose max-w-none">
                {typeof validationResult.detailedReport === 'string' ? (
                  <ReactMarkdown>{validationResult.detailedReport}</ReactMarkdown>
                ) : (
                  <div className="space-y-3">
                    {validationResult.detailedReport.map((item, index) => (
                      <div key={index} className={`p-3 rounded-md ${item.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium flex items-center">
                            {item.passed ? (
                              <FiCheck className="text-green-500 mr-1" />
                            ) : (
                              <FiX className="text-red-500 mr-1" />
                            )}
                            {item.category}
                          </div>
                          <div className={`font-medium text-sm ${
                            item.score >= 10 ? 'text-green-600' : 
                            item.score >= 5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {item.score} points
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{item.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions en bas de page */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onRunValidation(service.id)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isAnalyzing}
          >
            <FiRotateCw className="-ml-1 mr-2 h-5 w-5" />
            Analyser
          </button>
          <button
            onClick={() => onUpdateStatus(service.id, 'validated')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FiCheck className="-ml-1 mr-2 h-5 w-5" />
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceValidationDetails; 