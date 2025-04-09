import React, { useState, useEffect } from 'react';
import { Dispute, DisputeLogEntry } from '../../types';
import disputeLogService from '../../services/disputeLogService';
import { FiAlertCircle, FiClock, FiCheckCircle, FiXCircle, FiActivity, FiMessageSquare, FiUser, FiUsers, FiFileText, FiClipboard, FiSend, FiEye, FiMousePointer, FiBell, FiInfo } from 'react-icons/fi/index.js';

interface DisputeLogViewerProps {
  dispute: Dispute;
  orderId: string;
}

const DisputeLogViewer: React.FC<DisputeLogViewerProps> = ({ dispute, orderId }) => {
  const [logs, setLogs] = useState<DisputeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const logEntries = await disputeLogService.getDisputeLogs(dispute.id);
        setLogs(logEntries);
      } catch (err) {
        setError('Impossible de charger les journaux d\'activité');
        console.error('Erreur de chargement des logs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [dispute.id]);

  const toggleLogDetails = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };

  const getActionIcon = (action: DisputeLogEntry['action']) => {
    switch (action) {
      case 'création': return FiFileText;
      case 'commentaire': return FiMessageSquare;
      case 'pièce_jointe': return FiClipboard;
      case 'changement_statut': return FiActivity;
      case 'résolution': return FiCheckCircle;
      case 'vue': return FiEye;
      case 'clic': return FiMousePointer;
      case 'notification_envoyée': return FiSend;
      case 'notification_lue': return FiBell;
      case 'autre': return FiInfo;
      default: return FiInfo;
    }
  };

  const getUserTypeIcon = (userType: DisputeLogEntry['userType']) => {
    switch (userType) {
      case 'client': return FiUser;
      case 'vendeur': return FiUser;
      case 'admin': return FiUsers;
      case 'system': return FiActivity;
      default: return FiUser;
    }
  };

  const getUserTypeColor = (userType: DisputeLogEntry['userType']) => {
    switch (userType) {
      case 'client': return 'text-blue-500';
      case 'vendeur': return 'text-green-500';
      case 'admin': return 'text-purple-500';
      case 'system': return 'text-gray-500';
      default: return 'text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }).format(date) + ' UTC';
  };

  if (loading) {
    return <div className="p-4 flex justify-center">Chargement des journaux d'activité...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Journal d'activité du litige
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Historique complet des actions et événements
        </p>
      </div>
      
      {dispute.summary && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h4 className="text-sm font-medium text-indigo-800 mb-1">Résumé automatique</h4>
          <p className="text-sm text-indigo-700">{dispute.summary}</p>
        </div>
      )}

      <div className="bg-white">
        {logs.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            Aucune entrée de journal disponible
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const UserTypeIcon = getUserTypeIcon(log.userType);
              const userTypeColor = getUserTypeColor(log.userType);
              return (
                <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleLogDetails(log.id)}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${userTypeColor.replace('text-', 'bg-').replace('500', '100')}`}>
                      <UserTypeIcon className={`h-4 w-4 ${userTypeColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          <span className="inline-flex items-center">
                            <ActionIcon className="mr-1 h-4 w-4" />
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                        </p>
                        <div className="text-xs text-gray-500">{formatDate(log.createdAt)}</div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{log.details}</p>
                      
                      {expandedLogId === log.id && log.metadata && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-md text-xs font-mono">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Détails techniques</h5>
                          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.metadata, null, 2)}</pre>
                          {log.ipAddress && (
                            <div className="mt-2">
                              <span className="text-gray-500">IP:</span> {log.ipAddress}
                            </div>
                          )}
                          {log.userAgent && (
                            <div className="mt-1">
                              <span className="text-gray-500">Agent:</span> {log.userAgent}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DisputeLogViewer; 