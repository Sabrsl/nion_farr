import React, { useState } from 'react';
import { Dispute } from '../../types';
import { formatDate, timeAgo } from '../../utils/helpers';
import { FiAlertTriangle, FiFilter, FiSearch, FiUser, FiCheckCircle, FiX } from 'react-icons/fi';
import Link from 'next/link';

interface DisputeListProps {
  disputes: Dispute[];
  isAdmin?: boolean; // Si l'utilisateur est un administrateur
}

const DisputeList: React.FC<DisputeListProps> = ({ disputes, isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedDisputes, setExpandedDisputes] = useState<string[]>([]);

  // Filtrer les litiges en fonction des critères de recherche et du filtre de statut
  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = !searchTerm || 
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatusFilter = !statusFilter || dispute.status === statusFilter;
    
    return matchesSearch && matchesStatusFilter;
  });

  // Basculer l'état d'expansion d'un litige
  const toggleDispute = (disputeId: string) => {
    setExpandedDisputes(prev => 
      prev.includes(disputeId) 
        ? prev.filter(id => id !== disputeId) 
        : [...prev, disputeId]
    );
  };

  // Obtenir la couleur de badge en fonction du statut
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ouvert':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'résolu':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Obtenir l'icône en fonction du statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ouvert':
        return <FiAlertTriangle className="h-4 w-4" />;
      case 'résolu':
        return <FiCheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Litiges</h2>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin 
            ? 'Gérez les litiges ouverts par les utilisateurs' 
            : 'Vos litiges en cours et résolus'}
        </p>
      </div>
      
      {/* Filtres et recherche */}
      <div className="p-4 flex flex-wrap items-center gap-4 border-b border-gray-200 bg-gray-50">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un litige..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <FiFilter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tous les statuts</option>
            <option value="ouvert">Ouverts</option>
            <option value="résolu">Résolus</option>
          </select>
        </div>
      </div>
      
      {/* Liste des litiges */}
      <div className="divide-y divide-gray-200">
        {filteredDisputes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucun litige trouvé
          </div>
        ) : (
          filteredDisputes.map(dispute => {
            const isExpanded = expandedDisputes.includes(dispute.id);
            
            return (
              <div key={dispute.id} className="hover:bg-gray-50">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-start"
                  onClick={() => toggleDispute(dispute.id)}
                >
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}
                      >
                        <span className="mr-1">{getStatusIcon(dispute.status)}</span>
                        {dispute.status === 'ouvert' ? 'Ouvert' : 'Résolu'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Commande #{dispute.orderId.substring(0, 8)}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-medium text-gray-900">
                      {dispute.reason}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                      {dispute.details}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <FiUser className="mr-1 h-3 w-3" />
                      Initié par: {dispute.initiatedBy.substring(0, 8)}...
                      <span className="mx-1">•</span>
                      {timeAgo(dispute.createdAt)}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {isExpanded ? (
                      <FiX className="h-5 w-5 text-gray-400" />
                    ) : (
                      <svg 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {/* Détails du litige (visible quand développé) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 text-sm">
                    <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-1">Détails du problème:</h4>
                      <p className="text-gray-600 whitespace-pre-line">{dispute.details}</p>
                    </div>
                    
                    {dispute.resolution && (
                      <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
                        <h4 className="font-medium text-green-700 mb-1">Résolution:</h4>
                        <p className="text-green-600">
                          Résolu en faveur du {dispute.resolution === 'vendeur' ? 'vendeur' : 'client'}
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          {formatDate(dispute.resolvedAt)}
                        </p>
                      </div>
                    )}
                    
                    {/* Messages/Mises à jour */}
                    {dispute.updates && dispute.updates.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Historique:</h4>
                        <div className="space-y-2">
                          {dispute.updates.map((update, index) => (
                            <div key={index} className="flex items-start space-x-2 p-2 border-l-2 border-gray-300">
                              <div className="text-xs text-gray-500 shrink-0 w-24">
                                {timeAgo(update.createdAt)}
                              </div>
                              <div className="flex-grow">
                                <p className="text-gray-600">
                                  {update.type === 'status_change' ? (
                                    <span className="font-medium">{update.message}</span>
                                  ) : (
                                    update.message
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions (pour les administrateurs) */}
                    {isAdmin && dispute.status === 'ouvert' && (
                      <div className="mt-4 flex space-x-2">
                        <Link href={`/dashboard/admin/disputes/${dispute.id}`}>
                          <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Traiter ce litige
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DisputeList; 