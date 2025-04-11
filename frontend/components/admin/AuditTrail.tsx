import React, { useState, useEffect } from 'react';
import { 
  FiCheck, 
  FiEye, 
  FiEdit, 
  FiTrash2, 
  FiAlertTriangle, 
  FiUser,
  FiCalendar,
  FiClock,
  FiSearch,
  FiFilter
} from 'react-icons/fi/index.js';

// Import du service finance
import financeService, { AuditLogEntry } from '../../services/FinanceService';

interface AuditTrailProps {
  entityId?: string;
  entityType?: string;
  limit?: number; // Nombre d'entrées à afficher
  showFilters?: boolean;
  formatDate: (date: string) => string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({
  entityId,
  entityType,
  limit = 10,
  showFilters = true,
  formatDate
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [entityId, entityType, limit, filterAction, filterUser, searchTerm]);

  // Chargement des logs d'audit
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { logs, total } = await financeService.getAuditLogs({
        entityId,
        entityType,
        limit,
        action: filterAction !== 'all' ? filterAction : undefined,
        performedByRole: filterUser !== 'all' ? filterUser : undefined,
        searchTerm: searchTerm || undefined
      });
      
      setAuditLogs(logs);
      setTotalItems(total);
    } catch (error) {
      console.error('Erreur lors du chargement des logs d\'audit:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Icône pour l'action
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case 'update':
        return <FiEdit className="h-4 w-4 text-blue-500" />;
      case 'view':
        return <FiEye className="h-4 w-4 text-indigo-500" />;
      case 'delete':
        return <FiTrash2 className="h-4 w-4 text-red-500" />;
      case 'approve':
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case 'reject':
        return <FiAlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'process':
        return <FiClock className="h-4 w-4 text-purple-500" />;
      default:
        return <FiEye className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Style pour le badge de rôle
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Admin</span>;
      case 'system':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Système</span>;
      case 'client':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Client</span>;
      case 'freelancer':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Freelance</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{role}</span>;
    }
  };
  
  // Formatage de l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gestionnaire de changement de filtre
  const handleFilterChange = (filterType: 'action' | 'user', value: string) => {
    if (filterType === 'action') {
      setFilterAction(value);
    } else {
      setFilterUser(value);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Journal d'audit</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Historique des actions et modifications effectuées{entityType ? ` sur ${entityType}` : ''}{entityId ? ` #${entityId}` : ''}
        </p>
      </div>
      
      {showFilters && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-grow max-w-full sm:max-w-md">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Rechercher dans le journal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterAction}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="all">Toutes les actions</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="view">Consultation</option>
                <option value="delete">Suppression</option>
                <option value="approve">Approbation</option>
                <option value="reject">Rejet</option>
                <option value="process">Traitement</option>
              </select>
              
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterUser}
                onChange={(e) => handleFilterChange('user', e.target.value)}
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="admin">Administrateurs</option>
                <option value="system">Système</option>
                <option value="client">Clients</option>
                <option value="freelancer">Freelancers</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <FiSearch className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune entrée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucune entrée d'audit ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="flow-root border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th scope="col" className="hidden md:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date / Heure
                  </th>
                  <th scope="col" className="hidden lg:table-cell px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-1.5 text-xs sm:text-sm text-gray-900 capitalize">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 max-w-[150px] sm:max-w-none truncate sm:overflow-visible">
                      {log.details}
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm text-gray-900">{log.performedBy}</span>
                        <span className="mt-1">{getRoleBadge(log.performedByRole)}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{formatDate(log.timestamp)}</span>
                        <span className="text-xs text-gray-400">{formatTime(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalItems > limit && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="text-sm text-gray-500">
                Affichage des {auditLogs.length} entrées les plus récentes sur {totalItems}
              </div>
              {entityType && entityId && (
                <a 
                  href={`/admin/audit?entityType=${entityType}&entityId=${entityId}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Voir toutes les entrées
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditTrail; 