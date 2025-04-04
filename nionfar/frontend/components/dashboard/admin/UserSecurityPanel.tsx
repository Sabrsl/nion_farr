import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiUserX, FiUserCheck, FiCheckCircle, FiEye, FiPhone, FiGlobe, FiUsers } from 'react-icons/fi';
import securityService from '../../../services/securityService';
import { User } from '../../../types';
import { toast } from 'react-toastify';

interface UserSecurityPanelProps {
  userId: string;
  user?: User;
}

const UserSecurityPanel: React.FC<UserSecurityPanelProps> = ({ userId, user }) => {
  const [loading, setLoading] = useState(true);
  const [securityData, setSecurityData] = useState<any>(null);
  const [multiAccounts, setMultiAccounts] = useState<any>(null);
  const [showRelatedAccounts, setShowRelatedAccounts] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState<string>('warning');
  const [restrictionReason, setRestrictionReason] = useState<string>('');
  const [restrictionDuration, setRestrictionDuration] = useState<number>(24);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setLoading(true);
        const data = await securityService.detectAbnormalBehavior(userId);
        setSecurityData(data);
        
        if (data.risks.some(risk => risk.type === 'multi_accounts')) {
          const multiAccountsData = await securityService.detectMultiAccounts(userId);
          setMultiAccounts(multiAccountsData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données de sécurité:', error);
        toast.error('Impossible de charger les informations de sécurité');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, [userId]);

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleReportAccount = async () => {
    try {
      setActionInProgress(true);
      const result = await securityService.reportSuspiciousAccount(
        userId,
        'multi_account',
        'Détection automatique de comportement anormal'
      );
      
      if (result.success) {
        toast.success('Compte signalé avec succès pour vérification');
      } else {
        toast.error(result.message || 'Erreur lors du signalement du compte');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleApplyRestriction = async () => {
    if (!restrictionReason) {
      toast.error('Veuillez fournir une raison pour la restriction');
      return;
    }

    try {
      setActionInProgress(true);
      const result = await securityService.applyAccountRestriction(
        userId,
        selectedRestriction as any,
        restrictionReason,
        restrictionDuration
      );
      
      if (result.success) {
        toast.success(`Restriction appliquée avec succès`);
      } else {
        toast.error(result.message || 'Erreur lors de l\'application de la restriction');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FiAlertTriangle className="mr-2" />
          Analyse de sécurité
        </h3>
      </div>

      <div className="p-6">
        {!securityData || securityData.risks.length === 0 ? (
          <div className="text-center p-4">
            <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun comportement anormal détecté</h3>
            <p className="mt-1 text-sm text-gray-500">Ce compte ne présente pas de signes d'activité suspecte.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-gray-900">Score de risque</h4>
                <div className="px-3 py-1 rounded-full text-sm font-medium" 
                  style={{
                    backgroundColor: `rgba(${255 * (securityData.score / 100)}, ${255 * (1 - securityData.score / 100)}, 0, 0.2)`,
                    color: `rgb(${255 * (securityData.score / 100)}, ${255 * (1 - securityData.score / 100)}, 0)`
                  }}>
                  {securityData.score}/100
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full" 
                  style={{
                    width: `${securityData.score}%`,
                    background: `linear-gradient(90deg, rgb(0, 255, 0) 0%, rgb(255, 255, 0) 50%, rgb(255, 0, 0) 100%)`
                  }}></div>
              </div>
            </div>

            <h4 className="text-base font-medium text-gray-900 mb-4">Risques détectés</h4>
            <ul className="space-y-3 mb-6">
              {securityData.risks.map((risk: any, index: number) => (
                <li key={index} className="flex items-start p-3 bg-gray-50 rounded-md">
                  <div className={`flex-shrink-0 ${getRiskSeverityColor(risk.severity)}`}>
                    {risk.type === 'multi_accounts' && <FiUsers className="h-5 w-5" />}
                    {risk.type === 'shared_phone' && <FiPhone className="h-5 w-5" />}
                    {risk.type === 'shared_ip' && <FiGlobe className="h-5 w-5" />}
                    {(risk.type === 'location_mismatch' || risk.type === 'unusual_activity') && <FiAlertTriangle className="h-5 w-5" />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {risk.type === 'multi_accounts' && 'Détection de comptes multiples'}
                      {risk.type === 'shared_phone' && 'Numéro de téléphone partagé'}
                      {risk.type === 'shared_ip' && 'Adresse IP partagée'}
                      {risk.type === 'location_mismatch' && 'Localisation inhabituelle'}
                      {risk.type === 'unusual_activity' && 'Activité inhabituelle'}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                        risk.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {risk.severity === 'high' ? 'Élevé' : risk.severity === 'medium' ? 'Moyen' : 'Faible'}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{risk.details}</p>
                  </div>
                </li>
              ))}
            </ul>

            {multiAccounts && multiAccounts.hasMultiAccounts && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900">Comptes potentiellement liés ({multiAccounts.totalRelatedAccounts})</h4>
                  <button
                    className="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => setShowRelatedAccounts(!showRelatedAccounts)}
                  >
                    {showRelatedAccounts ? 'Masquer' : 'Afficher'}
                  </button>
                </div>

                {showRelatedAccounts && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {multiAccounts.relatedAccounts.map((account: any, index: number) => (
                        <li key={index} className="py-3">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-gray-900">ID: {account.id}</p>
                            <span className="text-xs text-gray-500">
                              Score de confiance: {Math.round(account.confidenceScore * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">Créé le: {new Date(account.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">
                            Raison: {account.matchReason === 'ip' ? 'Même adresse IP' :
                              account.matchReason === 'phone' ? 'Même numéro de téléphone' :
                              account.matchReason === 'device' ? 'Même appareil' :
                              account.matchReason === 'email_pattern' ? 'Modèle d\'email similaire' :
                              'Infos de paiement identiques'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-base font-medium text-gray-900 mb-4">Actions disponibles</h4>
              
              <div className="space-y-4">
                <div>
                  <button
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    onClick={handleReportAccount}
                    disabled={actionInProgress}
                  >
                    <FiEye className="mr-2 -ml-1 h-4 w-4" />
                    Signaler pour vérification manuelle
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-md">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Appliquer une restriction</h5>
                  
                  <div className="mb-3">
                    <label htmlFor="restrictionType" className="block text-xs font-medium text-gray-700 mb-1">
                      Type de restriction
                    </label>
                    <select
                      id="restrictionType"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={selectedRestriction}
                      onChange={(e) => setSelectedRestriction(e.target.value)}
                    >
                      <option value="warning">Avertissement</option>
                      <option value="limited_access">Accès limité</option>
                      <option value="payment_hold">Blocage des paiements</option>
                      <option value="suspension">Suspension temporaire</option>
                      <option value="ban">Bannissement</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="restrictionReason" className="block text-xs font-medium text-gray-700 mb-1">
                      Raison
                    </label>
                    <textarea
                      id="restrictionReason"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={restrictionReason}
                      onChange={(e) => setRestrictionReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="restrictionDuration" className="block text-xs font-medium text-gray-700 mb-1">
                      Durée (heures, 0 = permanent)
                    </label>
                    <input
                      type="number"
                      id="restrictionDuration"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={restrictionDuration}
                      onChange={(e) => setRestrictionDuration(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  
                  <button
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleApplyRestriction}
                    disabled={actionInProgress}
                  >
                    <FiUserX className="mr-2 -ml-1 h-4 w-4" />
                    Appliquer la restriction
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserSecurityPanel; 