import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiSearch, FiUsers, FiGlobe, FiPhone, FiUserX, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { securityService } from '../../../services/securityService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import UserSecurityPanel from '../../../components/dashboard/admin/UserSecurityPanel';

const SecurityDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('alerts');
  const [ipQuery, setIpQuery] = useState<string>('');
  const [phoneQuery, setPhoneQuery] = useState<string>('');
  const [ipResults, setIpResults] = useState<any | null>(null);
  const [phoneResults, setPhoneResults] = useState<any | null>(null);
  const [ipLoading, setIpLoading] = useState<boolean>(false);
  const [phoneLoading, setPhoneLoading] = useState<boolean>(false);

  // Simuler le chargement des alertes de sécurité
  useEffect(() => {
    const loadSecurityAlerts = async () => {
      try {
        setLoading(true);
        // Dans une implémentation réelle, vous feriez un appel API ici
        // Pour cet exemple, nous utilisons des données simulées
        const mockAlerts = [
          {
            id: 'alert-1',
            type: 'multi_accounts',
            severity: 'high',
            userId: 'user-123',
            userName: 'Jean Dupont',
            details: 'Détection de 3 comptes utilisant la même adresse IP et le même appareil',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'new'
          },
          {
            id: 'alert-2',
            type: 'shared_ip',
            severity: 'medium',
            userId: 'user-456',
            userName: 'Marie Martin',
            details: 'Utilisation de la même adresse IP que 5 autres utilisateurs',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            status: 'investigating'
          },
          {
            id: 'alert-3',
            type: 'shared_phone',
            severity: 'medium',
            userId: 'user-789',
            userName: 'Paul Bernard',
            details: 'Même numéro de téléphone utilisé sur 2 comptes différents',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            status: 'resolved'
          },
          {
            id: 'alert-4',
            type: 'unusual_activity',
            severity: 'low',
            userId: 'user-101',
            userName: 'Sophie Petit',
            details: 'Connexion depuis une localisation inhabituelle',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            status: 'new'
          }
        ];
        
        setSecurityAlerts(mockAlerts);
      } catch (error) {
        console.error('Erreur lors du chargement des alertes de sécurité:', error);
        toast.error('Impossible de charger les alertes de sécurité');
      } finally {
        setLoading(false);
      }
    };

    loadSecurityAlerts();
  }, []);

  const handleSearchIP = async () => {
    if (!ipQuery.trim()) {
      toast.error('Veuillez saisir une adresse IP');
      return;
    }
    
    try {
      setIpLoading(true);
      const results = await securityService.checkSharedIP(ipQuery);
      setIpResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche par IP:', error);
      toast.error('Erreur lors de la recherche par IP');
    } finally {
      setIpLoading(false);
    }
  };

  const handleSearchPhone = async () => {
    if (!phoneQuery.trim()) {
      toast.error('Veuillez saisir un numéro de téléphone');
      return;
    }
    
    try {
      setPhoneLoading(true);
      const results = await securityService.checkSharedPhone(phoneQuery);
      setPhoneResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche par téléphone:', error);
      toast.error('Erreur lors de la recherche par téléphone');
    } finally {
      setPhoneLoading(false);
    }
  };

  const filterAlerts = () => {
    if (!searchQuery) return securityAlerts;
    
    return securityAlerts.filter(alert => 
      alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.details.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'multi_accounts':
        return <FiUsers className="h-5 w-5" />;
      case 'shared_ip':
        return <FiGlobe className="h-5 w-5" />;
      case 'shared_phone':
        return <FiPhone className="h-5 w-5" />;
      default:
        return <FiAlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertStatusClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'investigating':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiAlertTriangle className="mr-2 text-orange-500" />
              Sécurité
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Gérez la détection des comportements anormaux et les alertes de sécurité
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'alerts' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('alerts')}
            >
              Alertes
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'ip' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('ip')}
            >
              Recherche par IP
            </button>
            <button
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'phone' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('phone')}
            >
              Recherche par téléphone
            </button>
          </div>

          {activeTab === 'alerts' && (
            <div>
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Rechercher par utilisateur, ID ou détails..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Détails
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filterAlerts().map((alert) => (
                        <tr key={alert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                alert.severity === 'high' ? 'bg-red-100' :
                                alert.severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'
                              }`}>
                                {getAlertTypeIcon(alert.type)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {alert.type === 'multi_accounts' && 'Multi-comptes'}
                                  {alert.type === 'shared_ip' && 'IP partagée'}
                                  {alert.type === 'shared_phone' && 'Téléphone partagé'}
                                  {alert.type === 'unusual_activity' && 'Activité inhabituelle'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getAlertSeverityClass(alert.severity)}`}>
                                    {alert.severity === 'high' ? 'Élevé' : alert.severity === 'medium' ? 'Moyen' : 'Faible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{alert.userName}</div>
                            <div className="text-sm text-gray-500">{alert.userId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{alert.details}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertStatusClass(alert.status)}`}>
                              {alert.status === 'new' ? 'Nouveau' : 
                               alert.status === 'investigating' ? 'En cours' : 'Résolu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => setSelectedUserId(alert.userId)}
                            >
                              Analyser
                            </button>
                            <Link href={`/dashboard/admin/users/${alert.userId}`}>
                              <a className="text-gray-600 hover:text-gray-900">
                                Profil
                              </a>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ip' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recherche par adresse IP</h3>
              <div className="flex space-x-4 mb-6">
                <div className="flex-grow">
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Entrez une adresse IP (ex: 192.168.1.1)"
                    value={ipQuery}
                    onChange={(e) => setIpQuery(e.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSearchIP}
                  disabled={ipLoading}
                >
                  {ipLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    'Rechercher'
                  )}
                </button>
              </div>

              {ipResults && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Résultats pour {ipQuery}</h4>
                  {ipResults.isShared ? (
                    <div>
                      <p className="text-sm text-orange-600 mb-2">
                        <FiAlertTriangle className="inline mr-1" />
                        Cette adresse IP est partagée par {ipResults.accountCount} comptes.
                      </p>
                      
                      {ipResults.accounts && ipResults.accounts.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Comptes associés:</h5>
                          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                            {ipResults.accounts.map((account: any, index: number) => (
                              <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-100">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{account.id}</p>
                                  <p className="text-xs text-gray-500">
                                    Créé: {new Date(account.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Link href={`/dashboard/admin/users/${account.id}`}>
                                  <a className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                    Voir profil
                                  </a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">
                      <FiCheckCircle className="inline mr-1" />
                      Cette adresse IP n'est pas partagée entre plusieurs comptes.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'phone' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recherche par numéro de téléphone</h3>
              <div className="flex space-x-4 mb-6">
                <div className="flex-grow">
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Entrez un numéro de téléphone (ex: +33612345678)"
                    value={phoneQuery}
                    onChange={(e) => setPhoneQuery(e.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleSearchPhone}
                  disabled={phoneLoading}
                >
                  {phoneLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                  ) : (
                    'Rechercher'
                  )}
                </button>
              </div>

              {phoneResults && (
                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Résultats pour {phoneQuery}</h4>
                  {phoneResults.isShared ? (
                    <div>
                      <p className="text-sm text-orange-600 mb-2">
                        <FiAlertTriangle className="inline mr-1" />
                        Ce numéro de téléphone est partagé par {phoneResults.accountCount} comptes.
                      </p>
                      
                      {phoneResults.accounts && phoneResults.accounts.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Comptes associés:</h5>
                          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                            {phoneResults.accounts.map((account: any, index: number) => (
                              <li key={index} className="px-4 py-3 flex justify-between items-center hover:bg-gray-100">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{account.id}</p>
                                  <p className="text-xs text-gray-500">
                                    Créé: {new Date(account.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Link href={`/dashboard/admin/users/${account.id}`}>
                                  <a className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                    Voir profil
                                  </a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">
                      <FiCheckCircle className="inline mr-1" />
                      Ce numéro de téléphone n'est pas partagé entre plusieurs comptes.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUserId && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Analyse de l'utilisateur</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedUserId(null)}
              >
                Fermer
              </button>
            </div>
            <UserSecurityPanel userId={selectedUserId} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecurityDashboard; 