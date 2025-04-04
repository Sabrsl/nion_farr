import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import { Dispute, Order, User } from '../../../types';
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiMessageSquare, 
  FiSend,
  FiArrowLeft,
  FiClock,
  FiUser,
  FiFileText,
  FiRefreshCw,
  FiHome,
  FiShoppingBag,
  FiEye
} from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { motion } from 'framer-motion';

const DisputeDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id || authLoading) return;

    const fetchDisputeDetails = async () => {
      setLoading(true);
      try {
        // En production, remplacer par un appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const mockDispute: Dispute = {
          id: id as string,
          orderId: 'order-123',
          initiatedBy: 'client-1',
          reason: 'Livraison non conforme',
          details: 'Le logo livré ne correspond pas aux spécifications que j\'ai fournies. Les couleurs sont différentes et la taille n\'est pas adaptée à mon site web.',
          attachments: [],
          status: 'ouvert',
          createdAt: '2023-09-10T15:30:00Z',
          updates: [
            {
              userId: 'client-1',
              message: 'Litige ouvert',
              createdAt: '2023-09-10T15:30:00Z',
              type: 'status_change'
            },
            {
              userId: 'seller-1',
              message: 'J\'ai bien reçu votre plainte et je suis désolé pour le désagrément. Pouvez-vous me donner plus de détails sur ce qui ne correspond pas à vos attentes?',
              createdAt: '2023-09-10T16:45:00Z',
              type: 'comment'
            },
            {
              userId: 'client-1',
              message: 'Les couleurs ne correspondent pas à ma charte graphique et le format du logo n\'est pas compatible avec mon entête de site.',
              createdAt: '2023-09-10T17:30:00Z',
              type: 'comment'
            }
          ],
          followers: []
        };

        // Mock order data
        const mockOrder: Order = {
          id: 'order-123',
          title: 'Création de logo pour entreprise',
          price: 250,
          deadline: '2023-09-15T23:59:59Z',
          status: 'litige',
          client: {
            id: 'client-1',
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            createdAt: '2023-01-15T12:00:00Z',
            role: 'client'
          },
          seller: {
            id: 'seller-1',
            name: 'Sophie Martin',
            email: 'sophie.martin@example.com',
            createdAt: '2022-11-05T09:30:00Z',
            role: 'freelancer'
          },
          service: {
            id: 'service-1',
            title: 'Création de logo professionnel',
            price: 250
          },
          createdAt: '2023-09-01T10:00:00Z',
          messages: [],
          isPaid: true,
          requirements: 'Création d\'un logo moderne pour une entreprise de services informatiques'
        };
        
        setDispute(mockDispute);
        setOrder(mockOrder);
      } catch (err) {
        console.error('Erreur lors du chargement du litige:', err);
        setError('Impossible de charger les détails du litige.');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputeDetails();
  }, [id, authLoading]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (e) {
      return 'Date inconnue';
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Veuillez entrer un commentaire.');
      return;
    }
    
    setCommentLoading(true);
    
    try {
      // En production, remplacer par un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simuler l'ajout d'un commentaire
      if (dispute && user) {
        const newUpdate = {
          userId: user.id,
          message: comment,
          createdAt: new Date().toISOString(),
          type: 'comment' as const
        };
        
        setDispute({
          ...dispute,
          updates: [...dispute.updates, newUpdate]
        });
        
        setComment('');
        toast.success('Commentaire ajouté avec succès.');
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      toast.error('Impossible d\'ajouter le commentaire. Veuillez réessayer.');
    } finally {
      setCommentLoading(false);
    }
  };

  const getUserInfo = (userId: string): { name: string; role: string } => {
    if (order) {
      if (userId === order.client.id) {
        return { 
          name: order.client.name, 
          role: 'client' 
        };
      }
      if (userId === order.seller.id) {
        return { 
          name: order.seller.name, 
          role: 'vendeur' 
        };
      }
    }
    return { name: 'Administrateur', role: 'admin' };
  };

  const canAddComment = () => {
    if (!user || !dispute || !order) return false;
    
    // Autoriser les commentaires quel que soit le statut du litige
    // if (dispute.status !== 'ouvert') return false;
    
    return user.id === order.client.id || 
           user.id === order.seller.id || 
           user.role === 'admin';
  };

  const handleFollowDispute = () => {
    if (!dispute || !user) return;
    
    // Ajouter l'utilisateur aux followers s'il n'y est pas déjà
    if (!dispute.followers?.includes(user.id)) {
      setDispute({
        ...dispute,
        followers: [...(dispute.followers || []), user.id]
      });
      toast.success('Vous suivez maintenant ce litige');
    } else {
      toast.info('Vous suivez déjà ce litige');
    }
  };

  const handleResolveDispute = (resolution: 'client' | 'vendeur') => {
    if (!dispute || !user || user.role !== 'admin') return;
    
    setDispute({
      ...dispute,
      status: 'résolu',
      resolvedAt: new Date().toISOString(),
      resolvedBy: user.id,
      resolution,
      updates: [
        ...dispute.updates,
        {
          userId: user.id,
          message: `Litige résolu en faveur du ${resolution}`,
          createdAt: new Date().toISOString(),
          type: 'resolution'
        }
      ]
    });
    
    toast.success(`Litige résolu en faveur du ${resolution}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dispute || !order) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error || "Impossible de charger les détails du litige. Veuillez réessayer plus tard."}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Détails du litige #{dispute.id} | Nionfar</title>
        <meta name="description" content={`Détails du litige concernant ${order.title}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Navigation et fil d'Ariane */}
          <nav className="flex items-center justify-between mb-6">
            <div>
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Tableau de bord
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link 
                    href="/dashboard/orders" 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Commandes
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link 
                    href="/dashboard/disputes" 
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Litiges
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">
                  {dispute.id}
                </li>
              </ol>
            </div>
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                Retour
              </button>
            </div>
          </nav>

          {/* Header du litige */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Colonne principale (2/3) */}
            <div className="flex-grow space-y-6">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <FiAlertTriangle className={`mr-2 h-5 w-5 ${
                          dispute.status === 'ouvert' ? 'text-amber-500' : 'text-green-500'
                        }`} />
                        Litige #{dispute.id}
                      </h1>
                      <p className="mt-1 text-sm text-gray-500">
                        Créé le {formatDate(dispute.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dispute.status === 'ouvert'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {dispute.status === 'ouvert' ? 'Ouvert' : 'Résolu'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-5">
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                      Raison du litige
                    </h2>
                    <p className="text-gray-700 font-medium">
                      {dispute.reason}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                      Description détaillée
                    </h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-line">
                        {dispute.details}
                      </p>
                    </div>
                  </div>

                  {dispute.status === 'résolu' && (
                    <div className="mb-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h2 className="text-lg font-medium text-green-800 mb-2 flex items-center">
                          <FiCheckCircle className="mr-2 h-5 w-5" />
                          Résolution
                        </h2>
                        <p className="text-green-700">
                          Ce litige a été résolu en faveur du {dispute.resolution}.
                        </p>
                        <p className="text-green-700 text-sm mt-1">
                          Résolu le {dispute.resolvedAt ? formatDate(dispute.resolvedAt) : 'N/A'}
                        </p>
                        <div className="mt-3 p-2 bg-white rounded border border-green-100">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Note importante :</span> Même après la résolution d'un litige, vous pouvez continuer à communiquer ici pour finaliser les détails ou clarifier certains points.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Historique de communication */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <FiMessageSquare className="mr-2 h-5 w-5 text-indigo-500" />
                      Historique de communication
                    </h2>
                    
                    <div className="space-y-4">
                      {dispute.updates.map((update, index) => {
                        const userInfo = getUserInfo(update.userId);
                        return (
                          <div 
                            key={index} 
                            className={`flex p-4 rounded-lg ${
                              update.type === 'status_change' || update.type === 'resolution'
                                ? 'bg-gray-50 border border-gray-200'
                                : userInfo.role === 'client'
                                ? 'bg-blue-50 border border-blue-100'
                                : userInfo.role === 'vendeur'
                                ? 'bg-purple-50 border border-purple-100'
                                : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex-shrink-0 mr-4">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                userInfo.role === 'client'
                                  ? 'bg-blue-100 text-blue-600'
                                  : userInfo.role === 'vendeur'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <FiUser className="h-5 w-5" />
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-baseline justify-between mb-1">
                                <h3 className="text-sm font-medium">
                                  <span className={`${
                                    userInfo.role === 'client'
                                      ? 'text-blue-800'
                                      : userInfo.role === 'vendeur'
                                      ? 'text-purple-800'
                                      : 'text-gray-800'
                                  }`}>
                                    {userInfo.name}
                                  </span>
                                  <span className="text-gray-500 ml-2">
                                    ({userInfo.role})
                                  </span>
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {formatDate(update.createdAt)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 whitespace-pre-line">
                                {update.message}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Formulaire d'ajout de commentaire */}
                    {canAddComment() ? (
                      <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3">
                          Ajouter un commentaire
                        </h3>
                        <form onSubmit={handleAddComment}>
                          <div className="mb-3">
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              placeholder="Écrivez votre message ici..."
                              rows={4}
                              className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md p-2"
                              disabled={commentLoading}
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={commentLoading}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {commentLoading ? (
                                <>
                                  <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                  Envoi en cours...
                                </>
                              ) : (
                                <>
                                  <FiSend className="-ml-1 mr-2 h-4 w-4" />
                                  Envoyer
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      dispute.status === 'résolu' && (
                        <div className="mt-6">
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-700">
                              Ce litige a été résolu, mais vous pouvez toujours ajouter des commentaires pour finaliser les détails.
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Colonne latérale (1/3) */}
            <div className="w-full md:w-80 space-y-6">
              {/* Informations sur la commande */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Informations importantes</h2>
                </div>
                <div className="px-4 py-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Commande</h3>
                    <Link href={`/dashboard/orders/${order.id}`} className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                      {order.id}
                      <FiArrowLeft className="ml-1 h-4 w-4 transform rotate-135" />
                    </Link>
                    <p className="mt-1 text-sm text-gray-900">{order.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Montant</h3>
                    <p className="mt-1 text-sm text-gray-900">{order.price.toLocaleString()} FCFA</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de la commande</h3>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{user?.role === 'freelancer' ? 'Client' : 'Vendeur'}</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.role === 'freelancer' ? order.client.name : order.seller.name}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions pour l'administrateur */}
              {user?.role === 'admin' && dispute.status === 'ouvert' && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="px-4 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Actions administrateur</h2>
                  </div>
                  <div className="px-4 py-5 space-y-4">
                    <p className="text-sm text-gray-500">
                      En tant qu'administrateur, vous pouvez résoudre ce litige en faveur de l'une des parties.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleResolveDispute('client')}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Pour le client
                      </button>
                      <button
                        onClick={() => handleResolveDispute('vendeur')}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Pour le vendeur
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suivi du litige */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Suivi du litige</h2>
                </div>
                <div className="px-4 py-5">
                  <p className="text-sm text-gray-500 mb-4">
                    Suivez ce litige pour recevoir des notifications sur son évolution.
                  </p>
                  <button
                    onClick={handleFollowDispute}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiEye className="mr-2 -ml-1 h-5 w-5" />
                    Suivre ce litige
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DisputeDetailPage; 