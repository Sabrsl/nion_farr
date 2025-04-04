import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../../../components/layouts/DashboardLayout';
import { Dispute, Order } from '../../../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatDate, timeAgo } from '../../../../utils/helpers';
import { FiAlertTriangle, FiLoader, FiCheckCircle, FiXCircle, FiArrowLeft, FiInfo, FiUser, FiMessageSquare } from 'react-icons/fi';
import Link from 'next/link';
import Button from '../../../../components/ui/Button';
import disputeService from '../../../../services/disputeService';

const DisputeDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<'vendeur' | 'client'>('client');
  const [resolutionReason, setResolutionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié après le chargement, rediriger vers la connexion
    if (!loading && !user) {
      router.push('/auth/login?redirect=/dashboard/admin/disputes');
      return;
    }

    // Si l'utilisateur n'est pas administrateur, rediriger vers la page d'accueil
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchDisputeDetails = async () => {
      if (!id || !user) return;

      setIsLoading(true);
      setError(null);

      try {
        // En production, ceci serait un appel API
        // const response = await fetch(`/api/disputes/${id}`);
        // const data = await response.json();
        
        // Simulation de données pour la démonstration
        const mockDispute: Dispute = {
          id: id as string,
          orderId: 'order123456',
          initiatedBy: 'user123',
          reason: 'Délai non respecté',
          details: 'Le vendeur n\'a pas livré la commande dans le délai convenu de 3 jours. Cela fait maintenant 7 jours et je n\'ai toujours pas reçu ma commande.',
          attachments: [],
          status: 'ouvert',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours avant
          updates: [
            {
              userId: 'user123',
              message: 'Litige ouvert',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'status_change'
            },
            {
              userId: 'admin123',
              message: 'Nous avons bien reçu votre demande et allons examiner ce litige.',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              type: 'comment'
            }
          ]
        };
        
        const mockOrder: Order = {
          id: 'order123456',
          title: 'Création d\'un logo professionnel',
          client: {
            id: 'user123',
            email: 'client@example.com',
            name: 'Client Test',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          service: {
            id: 'service456',
            title: 'Je vais créer un logo professionnel pour votre entreprise',
            price: 15000,
            provider: {
              id: 'seller789',
              email: 'freelancer@example.com', 
              name: 'Freelancer Test',
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
          },
          status: 'litige',
          price: 15000,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isPaid: true,
          requirements: 'Je souhaite un logo minimaliste représentant mon activité de conseil en marketing digital. Couleurs préférées: bleu et gris.',
          messages: []
        };
        
        setDispute(mockDispute);
        setOrder(mockOrder);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du litige:', error);
        setError('Une erreur est survenue lors de la récupération des détails du litige. Veuillez réessayer.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) {
      fetchDisputeDetails();
    }
  }, [id, user]);

  const handleDisputeResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !dispute || !order) return;
    
    if (!resolutionReason.trim()) {
      setError('Veuillez fournir une raison pour votre décision.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await disputeService.resolveDispute(
        dispute.id,
        user.id,
        resolution,
        resolutionReason
      );
      
      if (result.success) {
        // Mettre à jour le litige localement pour simuler la mise à jour
        setDispute(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            status: 'résolu',
            resolvedAt: new Date().toISOString(),
            resolvedBy: user.id,
            resolution,
            resolutionReason,
            updates: [
              ...(prev.updates || []),
              {
                userId: user.id,
                message: `Litige résolu en faveur du ${resolution === 'vendeur' ? 'vendeur' : 'client'}: ${resolutionReason}`,
                createdAt: new Date().toISOString(),
                type: 'resolution'
              }
            ]
          };
        });
        
        // Simuler la mise à jour du statut de la commande
        setOrder(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            status: 'terminée_manuellement'
          };
        });
        
        // Afficher un message de succès
        alert('Le litige a été résolu avec succès.');
        
        // Rediriger vers la liste des litiges après un court délai
        setTimeout(() => {
          router.push('/dashboard/admin/disputes');
        }, 2000);
      } else {
        setError(result.message || 'Une erreur est survenue lors de la résolution du litige.');
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du litige:', error);
      setError('Une erreur est survenue lors de la résolution du litige.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !dispute) return;
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsCommentSubmitting(true);
    
    try {
      const result = await disputeService.addDisputeComment(
        dispute.id,
        user.id,
        newComment
      );
      
      if (result.success) {
        // Mettre à jour le litige localement pour simuler l'ajout du commentaire
        setDispute(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            updates: [
              ...(prev.updates || []),
              {
                userId: user.id,
                message: newComment,
                createdAt: new Date().toISOString(),
                type: 'comment'
              }
            ]
          };
        });
        
        setNewComment('');
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'ajout du commentaire.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      setError('Une erreur est survenue lors de l\'ajout du commentaire.');
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Traitement du litige | Nionfar</title>
      </Head>
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center mb-4">
              <Link href="/dashboard/admin/disputes">
                <span className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mr-4">
                  <FiArrowLeft className="mr-1 h-5 w-5" />
                  Retour à la liste
                </span>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">Traitement du litige #{dispute?.id.substring(0, 8)}</h1>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="py-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <FiLoader className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
              ) : dispute && order ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Colonne 1: Informations du litige */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">Détails du litige</h3>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              dispute.status === 'ouvert' 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                : 'bg-green-100 text-green-800 border border-green-300'
                            }`}
                          >
                            {dispute.status === 'ouvert' ? (
                              <>
                                <FiAlertTriangle className="mr-1 h-4 w-4" />
                                Ouvert
                              </>
                            ) : (
                              <>
                                <FiCheckCircle className="mr-1 h-4 w-4" />
                                Résolu
                              </>
                            )}
                          </span>
                        </div>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Ouvert le {formatDate(dispute.createdAt)} • Commande #{order.id.substring(0, 8)}
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Motif du litige</dt>
                            <dd className="mt-1 text-sm text-gray-900">{dispute.reason}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Initié par</dt>
                            <dd className="mt-1 text-sm text-gray-900 flex items-center">
                              <FiUser className="mr-1 h-4 w-4 text-gray-400" />
                              {order.client.id === dispute.initiatedBy 
                                ? `${order.client.name} (Client)` 
                                : `${order.service.provider.name} (Vendeur)`}
                            </dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description du problème</dt>
                            <dd className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded border border-gray-200 whitespace-pre-line">
                              {dispute.details}
                            </dd>
                          </div>
                          
                          {dispute.status === 'résolu' && (
                            <>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Résolu en faveur de</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {dispute.resolution === 'vendeur' ? 'Vendeur' : 'Client'}
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Date de résolution</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatDate(dispute.resolvedAt)}</dd>
                              </div>
                              <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Motif de la décision</dt>
                                <dd className="mt-1 text-sm text-gray-900 p-3 bg-green-50 rounded border border-green-200">
                                  {dispute.resolutionReason}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                    
                    {/* Historique des mises à jour */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Historique des communications</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Toutes les communications relatives à ce litige
                        </p>
                      </div>
                      <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {dispute.updates.map((update, index) => (
                            <li key={index} className="px-4 py-4">
                              <div className="flex space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                    {update.type === 'status_change' ? (
                                      <FiAlertTriangle className="h-5 w-5" />
                                    ) : update.type === 'resolution' ? (
                                      <FiCheckCircle className="h-5 w-5" />
                                    ) : (
                                      <FiMessageSquare className="h-5 w-5" />
                                    )}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {update.userId === order.client.id 
                                      ? `${order.client.name} (Client)` 
                                      : update.userId === order.service.provider.id 
                                        ? `${order.service.provider.name} (Vendeur)` 
                                        : 'Administrateur'}
                                  </p>
                                  <p className="text-sm text-gray-500">{timeAgo(update.createdAt)}</p>
                                  <div className="mt-2 text-sm text-gray-700">
                                    <p className={update.type === 'status_change' || update.type === 'resolution' ? 'font-medium' : ''}>
                                      {update.message}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Formulaire d'ajout de commentaire */}
                      {dispute.status === 'ouvert' && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <form onSubmit={handleAddComment}>
                            <div>
                              <label htmlFor="comment" className="sr-only">Ajouter un commentaire</label>
                              <textarea
                                id="comment"
                                name="comment"
                                rows={3}
                                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                                placeholder="Ajouter un commentaire au litige..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={isCommentSubmitting}
                              />
                            </div>
                            <div className="mt-3 flex justify-end">
                              <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                disabled={isCommentSubmitting || !newComment.trim()}
                              >
                                {isCommentSubmitting ? 'Envoi...' : 'Envoyer'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Colonne 2: Détails de la commande et actions */}
                  <div className="space-y-6">
                    {/* Informations de la commande */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Détails de la commande</h3>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Service</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.service.title}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Montant</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.price.toLocaleString()} FCFA</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Date de commande</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Statut</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.status}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Client</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.client.name}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Vendeur</dt>
                            <dd className="mt-1 text-sm text-gray-900">{order.service.provider.name}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    
                    {/* Actions de résolution (uniquement si le litige est ouvert) */}
                    {dispute.status === 'ouvert' && (
                      <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">Résoudre le litige</h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Prenez une décision pour résoudre ce litige
                          </p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <FiInfo className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  Attention: La résolution d'un litige est définitive. Elle entraînera soit le 
                                  transfert des fonds au vendeur, soit un remboursement au client.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <form onSubmit={handleDisputeResolution} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Décision</label>
                              <div className="mt-1 space-y-2">
                                <div className="flex items-center">
                                  <input
                                    id="resolution-client"
                                    name="resolution"
                                    type="radio"
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    checked={resolution === 'client'}
                                    onChange={() => setResolution('client')}
                                    disabled={isSubmitting}
                                  />
                                  <label htmlFor="resolution-client" className="ml-3 block text-sm font-medium text-gray-700">
                                    En faveur du client (remboursement)
                                  </label>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    id="resolution-vendeur"
                                    name="resolution"
                                    type="radio"
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                    checked={resolution === 'vendeur'}
                                    onChange={() => setResolution('vendeur')}
                                    disabled={isSubmitting}
                                  />
                                  <label htmlFor="resolution-vendeur" className="ml-3 block text-sm font-medium text-gray-700">
                                    En faveur du vendeur (paiement)
                                  </label>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <label htmlFor="resolution-reason" className="block text-sm font-medium text-gray-700">
                                Motif de la décision *
                              </label>
                              <textarea
                                id="resolution-reason"
                                name="resolution-reason"
                                rows={4}
                                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                                placeholder="Expliquez votre décision..."
                                value={resolutionReason}
                                onChange={(e) => setResolutionReason(e.target.value)}
                                disabled={isSubmitting}
                                required
                              />
                            </div>
                            
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || !resolutionReason.trim()}
                                className="w-full"
                              >
                                {isSubmitting ? 'Traitement en cours...' : 'Résoudre le litige'}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-6">
                  <p className="text-center text-gray-500">Litige introuvable</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default DisputeDetailPage; 