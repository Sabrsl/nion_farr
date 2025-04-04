import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiAlertTriangle, FiInfo, FiUpload, FiFile, FiTrash } from 'react-icons/fi';
import { toast } from 'react-toastify';
import disputeService from '../../services/disputeService';
import { useAuth } from '../../contexts/AuthContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onDisputeSubmitted: () => void;
}

const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onDisputeSubmitted
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('Vous devez être connecté pour ouvrir un litige');
      return;
    }
    
    if (!reason) {
      setError('Veuillez sélectionner un motif de litige');
      return;
    }
    
    // Vérifier qu'il y a soit une description détaillée, soit des pièces jointes
    if ((!details || details.length < 20) && attachments.length === 0) {
      setError('Veuillez soit décrire le problème en détail (au moins 20 caractères), soit joindre une ou plusieurs pièces justificatives');
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const result = await disputeService.onDisputeOpened(
        orderId,
        user.id,
        reason,
        details,
        attachments
      );
      
      if (result.success) {
        toast.success('Votre litige a été ouvert avec succès');
        setReason('');
        setDetails('');
        setAttachments([]);
        onDisputeSubmitted();
      } else {
        setError(result.message || 'Une erreur est survenue lors de l\'ouverture du litige');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du litige:', error);
      setError('Une erreur est survenue lors de l\'ouverture du litige');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Limiter à 5 fichiers
      if (attachments.length + e.target.files.length > 5) {
        setError('Vous ne pouvez pas joindre plus de 5 fichiers');
        return;
      }
      
      // Vérifier la taille de chaque fichier (max 5 MB)
      const maxSize = 5 * 1024 * 1024; // 5 MB
      const newFiles = Array.from(e.target.files);
      
      const oversizedFiles = newFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(`Le(s) fichier(s) ${oversizedFiles.map(f => f.name).join(', ')} dépasse(nt) la taille maximale de 5 Mo`);
        return;
      }
      
      setAttachments(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const disputeReasons = [
    { id: 'deadlineMissed', label: 'Délai non respecté' },
    { id: 'qualityIssue', label: 'Qualité insatisfaisante' },
    { id: 'requirementsNotMet', label: 'Exigences non respectées' },
    { id: 'communicationIssue', label: 'Problème de communication' },
    { id: 'fraudSuspicion', label: 'Suspicion de fraude' },
    { id: 'other', label: 'Autre problème' }
  ];

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* Centrer la modale */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 flex items-center">
                  <FiAlertTriangle className="mr-2 text-yellow-500" />
                  Signaler un problème
                </Dialog.Title>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <FiInfo className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    L'ouverture d'un litige est une action sérieuse qui peut entraîner la suspension
                    de la commande. Cela doit être fait uniquement en cas de problème grave.
                    <strong className="block mt-1">Important</strong>: Vous devez fournir soit une description détaillée, soit des pièces jointes pour justifier votre litige.
                  </p>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motif du litige *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    disabled={isSubmitting}
                  >
                    <option value="">Sélectionnez un motif</option>
                    {disputeReasons.map(reason => (
                      <option key={reason.id} value={reason.label}>{reason.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                    Description détaillée du problème
                  </label>
                  <textarea
                    id="details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Veuillez décrire précisément le problème rencontré..."
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 20 caractères si vous ne fournissez pas de pièces jointes. Soyez précis.
                  </p>
                </div>
                
                {/* Section d'upload de fichiers */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pièces justificatives
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Uploader des fichiers</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleFileChange}
                            disabled={isSubmitting || attachments.length >= 5}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF jusqu'à 5 Mo (max 5 fichiers)
                      </p>
                    </div>
                  </div>
                  
                  {/* Liste des fichiers attachés */}
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers attachés:</h4>
                      <ul className="space-y-2">
                        {attachments.map((file, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <FiFile className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                              disabled={isSubmitting}
                            >
                              <FiTrash className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Ouvrir le litige'}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DisputeModal; 