import React, { useState } from 'react';
import { FiUpload, FiX, FiFile, FiSend, FiPaperclip } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';

interface DeliverableFormProps {
  orderId: string;
  onSubmit: (message: string, files: File[]) => Promise<boolean>;
  isRevision?: boolean; // Si c'est une révision ou une livraison initiale
}

const DeliverableForm: React.FC<DeliverableFormProps> = ({ 
  orderId, 
  onSubmit,
  isRevision = false
}) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Configuration du dropzone pour le téléchargement de fichiers
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: acceptedFiles => {
      // Limiter à 5 fichiers max
      if (files.length + acceptedFiles.length > 5) {
        toast.warning('Vous ne pouvez pas télécharger plus de 5 fichiers.');
        const allowedFiles = acceptedFiles.slice(0, 5 - files.length);
        setFiles([...files, ...allowedFiles]);
      } else {
        setFiles([...files, ...acceptedFiles]);
      }
    },
    // Accepter tous les types de fichiers, mais limiter la taille à 10 Mo
    maxSize: 10 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt']
    },
    noClick: true // Désactiver le clic sur le conteneur, on utilisera un bouton dédié
  });

  // Supprimer un fichier de la liste
  const removeFile = (fileToRemove: File) => {
    setFiles(files.filter(file => file !== fileToRemove));
  };

  // Formater la taille du fichier en KB ou MB
  const formatFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message) {
      toast.error('Veuillez ajouter un message décrivant votre livraison.');
      return;
    }
    
    setIsUploading(true);
    try {
      const success = await onSubmit(message, files);
      if (success) {
        setMessage('');
        setFiles([]);
        toast.success(isRevision 
          ? 'Votre révision a été envoyée avec succès.' 
          : 'Votre livraison a été envoyée avec succès.'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la livraison:', error);
      toast.error('Une erreur est survenue lors de l\'envoi.');
    } finally {
      setIsUploading(false);
    }
  };

  // Obtenir l'icône et la couleur de fond pour le type de fichier
  const getFileTypeInfo = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return { icon: '🖼️', bgColor: 'bg-blue-100' };
    } else if (['pdf'].includes(extension)) {
      return { icon: '📄', bgColor: 'bg-red-100' };
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return { icon: '📝', bgColor: 'bg-cyan-100' };
    } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
      return { icon: '📊', bgColor: 'bg-green-100' };
    } else if (['ppt', 'pptx'].includes(extension)) {
      return { icon: '📊', bgColor: 'bg-orange-100' };
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return { icon: '📦', bgColor: 'bg-yellow-100' };
    }
    
    return { icon: '📎', bgColor: 'bg-gray-100' };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isRevision ? 'Soumettre les modifications' : 'Livrer la commande'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="delivery-message" className="block text-sm font-medium text-gray-700 mb-1">
              Message au client
            </label>
            <textarea
              id="delivery-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRevision 
                ? "Décrivez les modifications que vous avez apportées..." 
                : "Décrivez votre livraison et donnez des instructions si nécessaire..."
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              required
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Fichiers joints ({files.length}/5)
              </label>
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={files.length >= 5}
              >
                <FiPaperclip className="mr-2 h-4 w-4" />
                Ajouter des fichiers
              </button>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <input {...getInputProps()} />
              
              {files.length === 0 ? (
                <div className="text-center">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Glissez-déposez des fichiers ici, ou{' '}
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-500 font-medium"
                      onClick={open}
                    >
                      parcourez
                    </button>{' '}
                    pour sélectionner des fichiers
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats supportés: PNG, JPG, PDF, DOC, XLSX, ZIP, etc. (max 10 MB)
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {files.map((file, index) => {
                    const fileTypeInfo = getFileTypeInfo(file);
                    
                    return (
                      <li key={index} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${fileTypeInfo.bgColor}`}>
                            <span className="text-xl">{fileTypeInfo.icon}</span>
                          </span>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500"
                        >
                          <FiX className="h-5 w-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || (!message && files.length === 0)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <FiSend className="mr-2 -ml-1 h-4 w-4" />
                  {isRevision ? 'Soumettre les modifications' : 'Livrer la commande'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliverableForm; 