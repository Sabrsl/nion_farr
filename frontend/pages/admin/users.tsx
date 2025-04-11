import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/layouts/AdminLayout';
import Head from 'next/head';
import { 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiChevronLeft, 
  FiChevronRight, 
  FiFilter, 
  FiDownload,
  FiUserCheck,
  FiUserX,
  FiUser,
  FiKey,
  FiShield,
  FiUserMinus,
  FiLock,
  FiBell,
  FiDollarSign,
  FiSlash,
  FiUserPlus
} from 'react-icons/fi/index.js';
import { classNames } from '../../utils/helpers';
import { toast } from 'react-toastify';
import UserPasswordModal from '../../components/dashboard/admin/UserPasswordModal';
import UserRestrictionsModal from '../../components/dashboard/admin/UserRestrictionsModal';
import UserActionsMenu from '../../components/dashboard/admin/UserActionsMenu';
import UserDetailsModal from '../../components/dashboard/admin/UserDetailsModal';
import UserAddModal from '../../components/dashboard/admin/UserAddModal';

/**
 * Page d'administration des utilisateurs
 */
const AdminUsersPage: NextPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRestrictionsModal, setShowRestrictionsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  useEffect(() => {
    // Simulation du chargement des données
    const fetchUsers = async () => {
      // Dans un cas réel, on chargerait les données depuis l'API
      // const response = await fetch(`/api/admin/users?page=${currentPage}&role=${selectedRole}&status=${selectedStatus}&search=${searchTerm}`);
      // const data = await response.json();
      
      // Données fictives pour le moment
      setTimeout(() => {
        const mockUsers = [
          { id: 1, name: 'Amadou Diop', email: 'amadou.diop@example.com', role: 'client', status: 'active', created: '2023-01-15', lastLogin: '2023-10-10' },
          { id: 2, name: 'Fatou Ndiaye', email: 'fatou.ndiaye@example.com', role: 'freelancer', status: 'active', created: '2023-02-22', lastLogin: '2023-10-12' },
          { id: 3, name: 'Omar Sall', email: 'omar.sall@example.com', role: 'client', status: 'inactive', created: '2023-03-10', lastLogin: '2023-09-20' },
          { id: 4, name: 'Mariama Ba', email: 'mariama.ba@example.com', role: 'freelancer', status: 'active', created: '2023-04-05', lastLogin: '2023-10-11' },
          { id: 5, name: 'Ibrahima Diallo', email: 'ibrahima.diallo@example.com', role: 'admin', status: 'active', created: '2023-01-10', lastLogin: '2023-10-14' },
          { id: 6, name: 'Aissatou Diallo', email: 'aissatou.diallo@example.com', role: 'client', status: 'pending', created: '2023-10-01', lastLogin: null },
          { id: 7, name: 'Mamadou Sow', email: 'mamadou.sow@example.com', role: 'freelancer', status: 'suspended', created: '2023-06-15', lastLogin: '2023-09-05' },
          { id: 8, name: 'Coumba Fall', email: 'coumba.fall@example.com', role: 'client', status: 'blocked', created: '2023-07-22', lastLogin: '2023-10-13' },
          { id: 9, name: 'Abdoulaye Kane', email: 'abdoulaye.kane@example.com', role: 'freelancer', status: 'disabled', created: '2023-08-19', lastLogin: '2023-10-10' },
          { id: 10, name: 'Rokhaya Diouf', email: 'rokhaya.diouf@example.com', role: 'freelancer', status: 'pending', created: '2023-10-05', lastLogin: null },
        ];
        
        // Filtrer les utilisateurs par rôle
        let filteredUsers = mockUsers;
        
        if (selectedRole !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === selectedRole);
        }
        
        // Filtrer les utilisateurs par statut
        if (selectedStatus !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.status === selectedStatus);
        }
        
        // Recherche
        if (searchTerm) {
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setUsers(filteredUsers);
        setTotalPages(Math.ceil(filteredUsers.length / 10));
        setLoading(false);
      }, 800);
    };
    
    fetchUsers();
  }, [currentPage, selectedRole, selectedStatus, searchTerm]);
  
  // Formatage de la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Badge de rôle
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
            Administrateur
          </span>
        );
      case 'freelancer':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Freelance
          </span>
        );
      case 'client':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Client
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {role}
          </span>
        );
    }
  };
  
  // Badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            <FiUserCheck className="mr-1 h-3 w-3" />
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            <FiUserMinus className="mr-1 h-3 w-3" />
            Inactif
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FiUser className="mr-1 h-3 w-3" />
            En attente
          </span>
        );
      case 'suspended':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
            <FiUserX className="mr-1 h-3 w-3" />
            Suspendu
          </span>
        );
      case 'blocked':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FiLock className="mr-1 h-3 w-3" />
            Bloqué
          </span>
        );
      case 'disabled':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FiUserX className="mr-1 h-3 w-3" />
            Désactivé
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <FiBell className="mr-1 h-3 w-3" />
            Avertissement
          </span>
        );
      case 'payment_hold':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
            <FiDollarSign className="mr-1 h-3 w-3" />
            Paiements bloqués
          </span>
        );
      case 'ban':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            <FiSlash className="mr-1 h-3 w-3" />
            Banni
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Handler pour la réinitialisation du mot de passe
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  // Handler pour la gestion des restrictions
  const handleManageRestrictions = (user: any) => {
    setSelectedUser(user);
    setShowRestrictionsModal(true);
  };

  // Handler pour afficher les détails d'un utilisateur
  const handleViewDetails = (user: any) => {
    // Stocker les détails de l'utilisateur sélectionné
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handler pour mettre à jour le statut d'un utilisateur
  const handleStatusChange = (userId: string, newStatus: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id.toString() === userId 
          ? { ...user, status: newStatus } 
          : user
      )
    );
  };

  // Handler pour ajouter un nouvel utilisateur
  const handleAddUser = (newUser: any) => {
    // Ajouter le nouvel utilisateur à la liste
    setUsers(prevUsers => [newUser, ...prevUsers]);
    
    // Fermer le modal après l'ajout
    setShowAddModal(false);
    
    // Afficher un message de confirmation
    toast.success(`L'utilisateur ${newUser.name} a été ajouté avec succès`);
  };

  return (
    <AdminLayout>
      <Head>
        <title>Gestion des utilisateurs | Admin NionFar</title>
      </Head>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Gestion des utilisateurs</h1>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => setShowAddModal(true)}
          >
            <FiUserPlus className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </button>
        </div>
        
        {/* Filtres et recherche */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="col-span-2">
              <label htmlFor="search" className="sr-only">Rechercher</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher par nom, email..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="all">Tous les rôles</option>
                <option value="client">Clients</option>
                <option value="freelancer">Freelances</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendus</option>
                <option value="blocked">Bloqués</option>
                <option value="disabled">Désactivés</option>
                <option value="warning">Avertissement</option>
                <option value="payment_hold">Paiements bloqués</option>
                <option value="ban">Bannis</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {users.length} utilisateur{users.length !== 1 ? 's' : ''} trouvé{users.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex space-x-2">
              <button 
                type="button" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiFilter className="-ml-0.5 mr-2 h-4 w-4" />
                Filtres avancés
              </button>
              <button 
                type="button" 
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiDownload className="-ml-0.5 mr-2 h-4 w-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>
        
        {/* Liste des utilisateurs */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date d'inscription
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                {user.name.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.created)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-3 justify-end">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Voir le profil"
                              onClick={() => handleViewDetails(user)}
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                              onClick={() => handleViewDetails(user)}
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Réinitialiser le mot de passe"
                              onClick={() => handleResetPassword(user)}
                            >
                              <FiKey className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-orange-600 hover:text-orange-900"
                              title="Gérer les restrictions"
                              onClick={() => handleManageRestrictions(user)}
                            >
                              <FiShield className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">1</span> à <span className="font-medium">{users.length}</span> sur <span className="font-medium">{users.length}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        className={classNames(
                          "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                          currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                        )}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Précédent</span>
                        <FiChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {/* Pages */}
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          className={classNames(
                            "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                            currentPage === i + 1
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          )}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        className={classNames(
                          "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50",
                          currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""
                        )}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <span className="sr-only">Suivant</span>
                        <FiChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && selectedUser && (
        <UserPasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          userId={selectedUser.id.toString()}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
        />
      )}

      {showRestrictionsModal && selectedUser && (
        <UserRestrictionsModal
          isOpen={showRestrictionsModal}
          onClose={() => setShowRestrictionsModal(false)}
          userId={selectedUser.id.toString()}
          userName={selectedUser.name}
          currentStatus={selectedUser.status}
        />
      )}

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          userId={selectedUser.id.toString()}
          onStatusChange={handleStatusChange}
          userData={selectedUser}
        />
      )}

      {showAddModal && (
        <UserAddModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleAddUser}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage; 