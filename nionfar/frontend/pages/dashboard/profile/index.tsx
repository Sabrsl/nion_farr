import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { FreelancerStats } from '../../../types';
import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiStar, 
  FiEdit, 
  FiAward, 
  FiClock,
  FiCheck,
  FiActivity, 
  FiMessageSquare,
  FiShoppingBag,
  FiBarChart2,
  FiTrendingUp,
  FiEye,
  FiRefreshCw,
  FiFileText,
  FiImage,
  FiMapPin,
  FiPhone
} from 'react-icons/fi';
import { freelancerStats, freelancerServices } from '../../../data/mockData';

const ProfilePage: NextPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    location: 'Dakar, Sénégal',
    phone: '+221 77 123 45 67',
    skills: ['Design graphique', 'UX/UI', 'Logo design', 'Branding', 'Illustration']
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats(freelancerStats);
        
        if (user) {
          setProfileForm({
            ...profileForm,
            username: user.username,
            email: user.email || '',
            bio: user.bio || '',
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Formater les montants en FCFA
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('fr-SN') + ' FCFA';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...profileForm.skills];
    newSkills[index] = value;
    setProfileForm(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const addSkill = () => {
    setProfileForm(prev => ({
      ...prev,
      skills: [...prev.skills, '']
    }));
  };

  const removeSkill = (index: number) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler un appel API pour mettre à jour le profil
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Afficher un message de succès (à intégrer avec une bibliothèque de notifications comme react-toastify)
    alert('Profil mis à jour avec succès');
    
    setEditMode(false);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mon Profil | NionFar.sn">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mon Profil | NionFar.sn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Colonne gauche - Informations de profil */}
          <div className="w-full md:w-2/3">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {/* Bannière et image de profil */}
              <div className="relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FiUser className="w-10 h-10 text-indigo-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu du profil */}
              <div className="pt-12 px-6 pb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                    <p className="text-gray-500 mt-1 flex items-center">
                      <FiAward className="mr-2" /> {user?.level}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm flex items-center hover:bg-indigo-700"
                  >
                    <FiEdit className="mr-2" /> Modifier
                  </button>
                </div>

                {!editMode ? (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FiStar className="mt-1 mr-3 text-yellow-500" />
                      <div>
                        <div className="font-medium">Évaluation</div>
                        <div className="text-gray-600">
                          {user?.rating} étoiles sur 5 • {stats?.analytics.totalReviews} avis
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FiCalendar className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Membre depuis</div>
                        <div className="text-gray-600">
                          {user?.memberSince?.toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FiMail className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">E-mail</div>
                        <div className="text-gray-600">{user?.email}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FiMapPin className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Localisation</div>
                        <div className="text-gray-600">{profileForm.location}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FiPhone className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Téléphone</div>
                        <div className="text-gray-600">{profileForm.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FiFileText className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Bio</div>
                        <div className="text-gray-600 mt-1">{user?.bio}</div>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FiActivity className="mt-1 mr-3 text-gray-400" />
                      <div>
                        <div className="font-medium">Compétences</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profileForm.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Localisation
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={profileForm.location}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profileForm.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compétences
                      </label>
                      {profileForm.skills.map((skill, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={skill}
                            onChange={(e) => handleSkillChange(index, e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <FiUser className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addSkill}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Ajouter une compétence
                      </button>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow-sm hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Services du freelancer */}
            <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Mes services ({freelancerServices.length})</h2>
                  <button
                    onClick={() => router.push('/dashboard/services/new')}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md shadow-sm text-sm hover:bg-indigo-700"
                  >
                    Ajouter un service
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {freelancerServices.map((service) => (
                  <div key={service.id} className="px-6 py-4 flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                      <img 
                        src={service.images[0] || '/img/placeholder.jpg'} 
                        alt={service.title}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{service.title}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <FiStar className="text-yellow-400 mr-1" /> 
                        {service.rating} ({service.totalReviews} avis)
                      </div>
                      <div className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/services/edit/${service.id}`)}
                      className="ml-4 text-indigo-600 hover:text-indigo-800"
                    >
                      <FiEdit className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Statistiques */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* Statistiques générales */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Statistiques</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-indigo-50">
                      <FiShoppingBag className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Commandes actives</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats?.activeOrders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-indigo-50">
                      <FiBarChart2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Total des commandes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats?.analytics.totalOrders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-indigo-50">
                      <FiEye className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Visites de profil</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats?.analytics.views}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-indigo-50">
                      <FiTrendingUp className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Taux de conversion</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats?.analytics.conversionRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 rounded-md bg-indigo-50">
                      <FiStar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="ml-3 text-sm text-gray-500">Avis en attente</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats?.pendingReviews}</span>
                </div>
              </div>
            </div>
            
            {/* Performance */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Performance</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Taux de réponse</span>
                    <span className="text-sm font-medium">{stats?.responseRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats?.responseRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Temps de réponse</span>
                    <span className="text-sm font-medium">{stats?.responseTime}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="text-indigo-600 mr-1" />
                    <span className="text-xs text-gray-500">Moins que la moyenne (4 heures)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Taux de complétion</span>
                    <span className="text-sm font-medium">{stats?.analytics.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats?.analytics.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Revenus */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Revenus</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total des gains</span>
                  <span className="font-medium">{formatCurrency(stats?.earnings.total || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Gains disponibles</span>
                  <span className="font-medium">{formatCurrency(stats?.earnings.available || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">En attente</span>
                  <span className="font-medium">{formatCurrency(stats?.earnings.pending || 0)}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/dashboard/earnings')}
                    className="w-full py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 text-sm"
                  >
                    Voir tous les revenus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage; 