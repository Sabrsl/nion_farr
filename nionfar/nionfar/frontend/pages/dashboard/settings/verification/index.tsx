import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiUpload, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi/index.js';
import { toast } from 'react-toastify';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../../contexts/AuthContext';
import { KycInfo } from '../../../../services/securityService';

// Créer une instance de service locale
const securityService = {
  verifyIdentity: async (userId: string) => {
    return {
      isVerified: false,
      kycInfo: {
        userId,
        status: 'incomplete' as const,
        phoneVerified: false,
        emailVerified: false,
        idVerified: false,
        addressVerified: false
      },
      canWithdraw: false,
      reasons: ['Service simulé']
    };
  }
};

const VerificationPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || 'mock-user-id';
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kycInfo, setKycInfo] = useState<KycInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // États pour les fichiers chargés
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [addressDocument, setAddressDocument] = useState<File | null>(null);
  const [selfieDocument, setSelfieDocument] = useState<File | null>(null);
  
  // Charger les informations KYC de l'utilisateur
  useEffect(() => {
    const loadKycInfo = async () => {
      setIsLoading(true);
      try {
        const identityStatus = await securityService.verifyIdentity(userId);
        setKycInfo(identityStatus.kycInfo);
      } catch (error) {
        console.error('Erreur lors du chargement des informations KYC:', error);
        toast.error('Impossible de charger vos informations de vérification');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadKycInfo();
  }, [userId]);
  
  // Gérer le changement de fichier
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  // Soumettre le formulaire de vérification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idDocument && !addressDocument && !selfieDocument) {
      toast.error('Veuillez charger au moins un document');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi de documents
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Vos documents ont été soumis avec succès.');
      
      // Recharger les informations KYC après soumission
      const identityStatus = await securityService.verifyIdentity(userId);
      setKycInfo(identityStatus.kycInfo);
      
    } catch (error) {
      console.error('Erreur lors de la soumission des documents:', error);
      toast.error('Erreur lors de la soumission des documents');
    } finally {
      setIsSubmitting(false);
      
      // Réinitialiser les fichiers après soumission
      setIdDocument(null);
      setAddressDocument(null);
      setSelfieDocument(null);
      
      // Réinitialiser les champs de fichier
      const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
      fileInputs.forEach(input => {
        input.value = '';
      });
    }
  };
  
  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Afficher le statut du document
  const renderDocumentStatus = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="mr-1" /> Vérifié
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiInfo className="mr-1" /> En attente
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiAlertCircle className="mr-1" /> Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Non soumis
          </span>
        );
    }
  };
  
  // Afficher le statut général KYC
  const renderKycStatus = () => {
    if (!kycInfo) return null;
    
    switch (kycInfo.status) {
      case 'verified':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheck className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Vérification complète</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Votre compte est entièrement vérifié. Vous pouvez effectuer des retraits sans limitation.</p>
                  <p className="mt-1">Date de vérification : {formatDate(kycInfo.verificationDate)}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Vérification en cours</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Votre demande de vérification est en cours de traitement. Nous vous notifierons dès qu'elle sera terminée.</p>
                  <p className="mt-1">Date de soumission : {formatDate(kycInfo.submissionDate)}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'rejected':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Vérification rejetée</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Votre demande de vérification a été rejetée. Veuillez soumettre des documents à jour.</p>
                  <p className="mt-1">Raison : {kycInfo.rejectionReason || 'Documents non conformes'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'incomplete':
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiInfo className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Vérification incomplète</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Veuillez compléter votre procédure de vérification en soumettant tous les documents requis.</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <DashboardLayout title="Vérification d'identité | NionFar.sn">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification d'identité</h1>
          <p className="text-gray-600 mb-6">
            Complétez votre vérification d'identité pour débloquer toutes les fonctionnalités de la plateforme, notamment les retraits.
          </p>
          
          {/* État actuel de la vérification KYC */}
          {!isLoading && renderKycStatus()}
          
          {/* Statut des vérifications individuelles */}
          {!isLoading && kycInfo && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Statut des vérifications</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Numéro de téléphone</h3>
                    {kycInfo.phoneVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1" /> Vérifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiAlertCircle className="mr-1" /> Non vérifié
                      </span>
                    )}
                  </div>
                  {!kycInfo.phoneVerified && (
                    <button 
                      onClick={() => router.push('/dashboard/settings/profile')}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Mettre à jour dans vos paramètres →
                    </button>
                  )}
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Adresse email</h3>
                    {kycInfo.emailVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="mr-1" /> Vérifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <FiAlertCircle className="mr-1" /> Non vérifié
                      </span>
                    )}
                  </div>
                  {!kycInfo.emailVerified && (
                    <button 
                      onClick={() => router.push('/dashboard/settings/profile')}
                      className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Mettre à jour dans vos paramètres →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Formulaire de soumission de documents */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Documents d'identité</h2>
            
            {/* Liste des documents soumis */}
            {!isLoading && kycInfo && kycInfo.documents && kycInfo.documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Documents soumis</h3>
                <div className="space-y-3">
                  {kycInfo.documents.map((doc, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-sm">
                          {doc.type === 'id' ? 'Pièce d\'identité' : 
                           doc.type === 'address' ? 'Justificatif de domicile' : 'Selfie'}
                        </span>
                        <p className="text-xs text-gray-500">Soumis le {formatDate(doc.uploadDate)}</p>
                      </div>
                      {renderDocumentStatus(doc.status)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Formulaire de téléchargement */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pièce d'identité (CNI, Passeport)
                  </label>
                  <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="id-document" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Télécharger un fichier</span>
                          <input
                            id="id-document"
                            name="id-document"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => handleFileChange(e, setIdDocument)}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                  {idDocument && (
                    <p className="mt-2 text-sm text-green-600">
                      Fichier sélectionné: {idDocument.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Justificatif de domicile (Facture d'électricité, eau, etc.)
                  </label>
                  <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="address-document" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Télécharger un fichier</span>
                          <input
                            id="address-document"
                            name="address-document"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(e) => handleFileChange(e, setAddressDocument)}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                  {addressDocument && (
                    <p className="mt-2 text-sm text-green-600">
                      Fichier sélectionné: {addressDocument.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selfie avec votre pièce d'identité
                  </label>
                  <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="selfie-document" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Télécharger un fichier</span>
                          <input
                            id="selfie-document"
                            name="selfie-document"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png"
                            onChange={(e) => handleFileChange(e, setSelfieDocument)}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG jusqu'à 10MB
                      </p>
                    </div>
                  </div>
                  {selfieDocument && (
                    <p className="mt-2 text-sm text-green-600">
                      Fichier sélectionné: {selfieDocument.name}
                    </p>
                  )}
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || (!idDocument && !addressDocument && !selfieDocument)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <FiUpload className="mr-2" /> Soumettre les documents
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VerificationPage; 