import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiAlertCircle, FiFile, FiImage, FiX, FiCheck } from 'react-icons/fi';

type CustomDropzoneProps = {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  children?: React.ReactNode;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact';
  showPreview?: boolean;
};

export const Dropzone: React.FC<CustomDropzoneProps> = ({
  onDrop,
  className = '',
  children,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept,
  multiple = true,
  disabled = false,
  variant = 'default',
  showPreview = true,
}) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Reset error state
    setFileError(null);
    
    // Handle file rejections
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(file => {
        const errors = file.errors.map((e: any) => e.message).join(', ');
        return `${file.file.name}: ${errors}`;
      }).join('; ');
      
      setFileError(errorMessages);
      return;
    }
    
    // Simulate upload effect
    setUploading(true);
    setFiles(acceptedFiles);
    
    setTimeout(() => {
      setUploading(false);
      onDrop(acceptedFiles);
    }, 1000);
    
  }, [onDrop]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    open
  } = useDropzone({
    onDrop: handleDrop,
    maxFiles,
    maxSize,
    accept,
    multiple,
    disabled,
    noClick: variant === 'compact' // Prevent click triggering file dialog in compact mode
  });

  // Update dragging state
  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  // Get file icon based on mime type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <FiImage className="w-6 h-6 text-indigo-600" />;
    }
    return <FiFile className="w-6 h-6 text-indigo-600" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render preview of files
  const renderFilePreview = () => {
    if (!showPreview || files.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100"
          >
            {getFileIcon(file)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
            <div className="flex-shrink-0">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiCheck className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // If children are provided, use them instead of default content
  if (children) {
    return (
      <div className="w-full">
        <div
          {...getRootProps()}
          className={`${className} ${isDragging ? 'border-indigo-400 bg-indigo-50' : ''}`}
        >
          <input {...getInputProps()} />
          {children}
        </div>
        {renderFilePreview()}
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center mt-2 text-sm text-red-600"
            >
              <FiAlertCircle className="mr-1.5 flex-shrink-0" />
              <span>{fileError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render compact variant
  if (variant === 'compact') {
    return (
      <div className="w-full">
        <div
          {...getRootProps()}
          className={`relative rounded-lg ${className} ${
            isDragging 
              ? 'border-indigo-400 bg-indigo-50' 
              : 'border-gray-300 border-dashed bg-gray-50'
          } border-2 transition-all duration-200 touch-manipulation`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <button 
              type="button"
              onClick={open}
              disabled={disabled}
              className="mb-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <FiUploadCloud className="mr-1.5 h-4 w-4" />
              Choisir un fichier
            </button>
            <p className="text-xs text-gray-500">
              {multiple ? 'PNG, JPG, PDF jusqu\'à ' : 'PNG, JPG, PDF jusqu\'à '}
              {formatFileSize(maxSize)}
            </p>
          </div>
          
          {isDragActive && (
            <div className="absolute inset-0 bg-indigo-600 bg-opacity-10 rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FiUploadCloud className="h-8 w-8 text-indigo-600 mx-auto" />
                </motion.div>
                <p className="text-sm font-medium text-indigo-800 mt-2">Déposer le fichier ici</p>
              </div>
            </div>
          )}
        </div>
        
        {renderFilePreview()}
        
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center mt-2 text-sm text-red-600"
            >
              <FiAlertCircle className="mr-1.5 flex-shrink-0" />
              <span>{fileError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render default variant
  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`${className} transition-all duration-200 ease-in-out relative border-2 border-dashed rounded-lg p-6 cursor-pointer text-center hover:bg-gray-50 active:bg-indigo-50 touch-manipulation ${
          isDragging 
            ? 'border-indigo-400 bg-indigo-50 border-solid' 
            : 'border-gray-300 hover:border-indigo-300'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
          <div className="mb-3 sm:mb-0">
            <motion.div
              animate={{ scale: isDragging ? 1.2 : 1 }}
              transition={{ duration: 0.2 }}
              className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center"
            >
              <FiUploadCloud className="h-8 w-8 text-indigo-600" />
            </motion.div>
          </div>
          
          <div className="text-sm sm:text-base">
            <p className="font-medium text-gray-900 mb-1">
              {isDragging 
                ? "Relâchez pour déposer les fichiers" 
                : disabled 
                  ? "Téléchargement désactivé" 
                  : "Glissez-déposez vos fichiers ici"
              }
            </p>
            <p className="text-gray-500 text-sm">
              ou <span className="text-indigo-600 font-medium">parcourez vos fichiers</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {multiple ? 'Formats acceptés: ' : 'Format accepté: '}
              {accept 
                ? Object.values(accept).flat().join(', ').replace(/\./g, '') 
                : 'PNG, JPG, PDF'}
              {' - '}Taille max: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
        
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-indigo-50 bg-opacity-80 flex items-center justify-center rounded-lg"
          >
            <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mx-auto mb-2"
              >
                <FiUploadCloud className="h-10 w-10 text-indigo-600 mx-auto" />
              </motion.div>
              <p className="text-indigo-800 font-medium">Déposez pour télécharger</p>
            </div>
          </motion.div>
        )}
      </div>
      
      {renderFilePreview()}
      
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center mt-2 px-3 py-2 rounded-md bg-red-50 border border-red-100"
          >
            <FiAlertCircle className="mr-1.5 flex-shrink-0 text-red-500" />
            <span className="text-sm text-red-600">{fileError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 