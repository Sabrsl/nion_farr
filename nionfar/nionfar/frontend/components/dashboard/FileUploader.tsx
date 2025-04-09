import React, { useState, useRef, useEffect } from 'react';
import { 
  FiPaperclip, 
  FiX, 
  FiFile, 
  FiFileText, 
  FiImage, 
  FiVideo,
  FiMusic,
  FiDownload,
  FiMaximize,
  FiUploadCloud,
  FiEye
} from 'react-icons/fi/index.js';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  showPreview?: boolean;
  currentFiles?: File[];
  onRemoveFile?: (index: number) => void;
  isDisabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSizeMB = 10,
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
  multiple = true,
  showPreview = true,
  currentFiles = [],
  onRemoveFile,
  isDisabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<{[key: string]: string}>({});
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Générer des aperçus pour les images
  useEffect(() => {
    const newPreviews: {[key: string]: string} = {};
    
    currentFiles.forEach((file, index) => {
      // Vérifier si c'est une image
      if (file.type.startsWith('image/')) {
        // Créer un objet URL pour l'aperçu si ce n'est pas déjà fait
        if (!imagePreviewUrls[`${file.name}-${index}`]) {
          const fileReader = new FileReader();
          fileReader.onload = (e) => {
            if (e.target?.result) {
              newPreviews[`${file.name}-${index}`] = e.target.result as string;
              setImagePreviewUrls(prev => ({ ...prev, ...newPreviews }));
            }
          };
          fileReader.readAsDataURL(file);
        }
      }
    });
    
    // Nettoyer les URL des objets quand les fichiers sont supprimés
    return () => {
      Object.values(imagePreviewUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [currentFiles]);

  // Ouvrir la prévisualisation d'image
  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewModalOpen(true);
  };

  // Gérer le clic sur la zone de dépôt
  const handleClick = () => {
    if (isDisabled) return;
    console.log("Clicked on drop zone, fileInputRef exists:", !!fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error("File input reference not found");
    }
  };

  // Gérer le changement de fichiers dans l'input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      validateAndProcessFiles(filesArray);
    }
  };

  // Gérer le glisser-déposer
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Gérer le dépôt de fichiers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (isDisabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      validateAndProcessFiles(filesArray);
    }
  };

  // Valider et traiter les fichiers
  const validateAndProcessFiles = (files: File[]) => {
    setError(null);
    
    // Vérifier le nombre de fichiers
    if (currentFiles.length + files.length > maxFiles) {
      setError(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers à la fois.`);
      return;
    }
    
    // Vérifier la taille des fichiers
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes);
    if (oversizedFiles.length > 0) {
      setError(`Certains fichiers dépassent la taille maximale de ${maxSizeMB} MB.`);
      return;
    }
    
    // Vérifier les types de fichiers
    if (allowedTypes.length > 0) {
      const invalidFiles = files.filter(file => {
        // Vérifier si le type MIME du fichier correspond à l'un des types autorisés
        return !allowedTypes.some(type => {
          if (type.includes('*')) {
            // Pour les types génériques comme "image/*"
            return file.type.startsWith(type.split('/')[0]);
          } else if (type.startsWith('.')) {
            // Pour les extensions comme ".pdf"
            return file.name.toLowerCase().endsWith(type);
          } else {
            // Pour les types MIME complets
            return file.type === type;
          }
        });
      });
      
      if (invalidFiles.length > 0) {
        setError(`Certains fichiers ont un format non pris en charge.`);
        return;
      }
    }
    
    // Passer les fichiers validés
    onFilesSelected(files);
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Obtenir l'icône appropriée pour le type de fichier
  const getFileIcon = (file: File) => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return <FiImage className="h-5 w-5 text-indigo-500" />;
    } else if (fileType.startsWith('video/')) {
      return <FiVideo className="h-5 w-5 text-red-500" />;
    } else if (fileType.startsWith('audio/')) {
      return <FiMusic className="h-5 w-5 text-green-500" />;
    } else if (fileType === 'application/pdf') {
      return <FiFileText className="h-5 w-5 text-red-600" />;
    } else if (fileType.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      return <FiFileText className="h-5 w-5 text-blue-600" />;
    } else if (fileType.includes('sheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
      return <FiFileText className="h-5 w-5 text-green-600" />;
    } else {
      return <FiFile className="h-5 w-5 text-gray-500" />;
    }
  };

  // Formatter la taille des fichiers
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className={`w-full ${isDisabled ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Zone de glisser-déposer */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        } ${isDisabled ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <FiUploadCloud className={`h-12 w-12 mb-2 ${isDisabled ? 'text-gray-400' : 'text-indigo-400'}`} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDisabled 
              ? 'Chargement en cours...' 
              : 'Glissez-déposez vos fichiers ici ou cliquez pour parcourir'}
          </p>
          <p className="text-xs text-gray-500">
            {multiple ? `${maxFiles} fichiers maximum` : '1 fichier uniquement'} • {maxSizeMB} MB max •{' '}
            {allowedTypes.includes('image/*') ? 'Images, ' : ''}
            {allowedTypes.includes('application/pdf') ? 'PDF, ' : ''}
            {allowedTypes.some(t => t.endsWith('.doc') || t.endsWith('.docx')) ? 'Documents, ' : ''}
            {allowedTypes.includes('*') ? 'Tous types' : ''}
          </p>
        </div>
      </div>
      
      {/* Message d'erreur */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          <span>{error}</span>
        </div>
      )}
      
      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Prévisualisation des fichiers */}
      {showPreview && currentFiles.length > 0 && (
        <div className="mt-4">
          {/* Images preview grid */}
          {currentFiles.some(file => file.type.startsWith('image/')) && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Images</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {currentFiles.map((file, index) => {
                  if (file.type.startsWith('image/')) {
                    const previewKey = `${file.name}-${index}`;
                    const hasPreview = !!imagePreviewUrls[previewKey];
                    
                    return (
                      <div 
                        key={previewKey}
                        className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group"
                      >
                        {hasPreview ? (
                          <>
                            <img 
                              src={imagePreviewUrls[previewKey]} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => openImagePreview(imagePreviewUrls[previewKey])}
                                className="p-1.5 bg-white rounded-full text-gray-700 hover:text-indigo-600 mx-1"
                              >
                                <FiEye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onRemoveFile) onRemoveFile(index);
                                }}
                                className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 mx-1"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <div className="animate-pulse text-gray-400">
                              <FiImage className="h-8 w-8" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {/* Other files list */}
          <div className="space-y-2">
            {currentFiles.map((file, index) => {
              if (!file.type.startsWith('image/')) {
                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                  >
                    <div className="flex items-center">
                      {getFileIcon(file)}
                      <div className="ml-2 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveFile) onRemoveFile(index);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
      
      {/* Modal de prévisualisation d'image */}
      {previewModalOpen && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src={previewImage} 
              alt="Aperçu" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 