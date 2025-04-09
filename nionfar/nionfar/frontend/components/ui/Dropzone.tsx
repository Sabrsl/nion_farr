import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useDropzone, FileRejection, Accept, FileError } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiAlertCircle, FiFile, FiImage, FiX, FiCheck, FiFileText, FiVideo, FiMusic } from 'react-icons/fi/index.js';
import classNames from 'classnames';

// Constants for reuse
const ANIMATION_DURATION = 0.2;
const DRAG_OVERLAY_OPACITY = 0.8;
const SIMULATED_UPLOAD_DELAY = 1000;

// Types and interfaces
export interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  children?: React.ReactNode;
  maxFiles?: number;
  maxSize?: number;
  accept?: Accept; // Use the type from react-dropzone
  multiple?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  showPreview?: boolean;
  allowRemove?: boolean;
  uploadProgress?: number;
  preventDefaultDrop?: boolean;
  onError?: (error: string) => void;
  onFileRemove?: (file: File) => void;
}

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getErrorMessage = (fileRejections: FileRejection[]): string => {
  // Get the first rejection's first error message by default
  if (fileRejections.length === 0) return '';
  
  // Check if there are too many files
  const tooManyFilesError = fileRejections
    .flatMap(rejection => rejection.errors)
    .find(error => error.code === 'too-many-files');
    
  if (tooManyFilesError) {
    return tooManyFilesError.message;
  }

  // Otherwise, format all error messages
  return fileRejections.map(rejection => {
    const fileName = rejection.file.name;
    const errors = rejection.errors.map((error: FileError) => error.message).join(', ');
    return `${fileName}: ${errors}`;
  }).join('; ');
};

/**
 * Dropzone component for file uploads with various display options and animations
 */
export const Dropzone = memo<DropzoneProps>(({
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
  allowRemove = false,
  uploadProgress,
  preventDefaultDrop = true,
  onError,
  onFileRemove,
}) => {
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Reset error state
    setFileError(null);
    
    // Handle file rejections
    if (rejectedFiles.length > 0) {
      const errorMessage = getErrorMessage(rejectedFiles);
      setFileError(errorMessage);
      onError?.(errorMessage);
      return;
    }
    
    // No files selected
    if (acceptedFiles.length === 0) {
      return;
    }
    
    // Simulate upload effect if uploadProgress is not provided
    if (uploadProgress === undefined) {
      setUploading(true);
    }
    
    setFiles(acceptedFiles);
    
    // If uploadProgress is provided, just pass files to parent
    if (uploadProgress !== undefined) {
      onDrop(acceptedFiles);
      return;
    }
    
    // Otherwise simulate an upload
    setTimeout(() => {
      setUploading(false);
      onDrop(acceptedFiles);
    }, SIMULATED_UPLOAD_DELAY);
    
  }, [onDrop, uploadProgress, onError]);

  // Remove file from the list
  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    onFileRemove?.(fileToRemove);
  }, [files, onFileRemove]);

  // Dropzone hook
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
    noClick: variant === 'compact' || variant === 'minimal', // Prevent click triggering file dialog in compact/minimal modes
    preventDropOnDocument: preventDefaultDrop,
  });

  // Update dragging state
  useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  // Get file icon based on mime type
  const getFileIcon = useCallback((file: File) => {
    const type = file.type;
    
    if (type.startsWith('image/')) {
      return <FiImage className="w-6 h-6 text-indigo-600" aria-hidden="true" />;
    } else if (type.startsWith('video/')) {
      return <FiVideo className="w-6 h-6 text-purple-600" aria-hidden="true" />;
    } else if (type.startsWith('audio/')) {
      return <FiMusic className="w-6 h-6 text-green-600" aria-hidden="true" />;
    } else if (type === 'application/pdf' || type.includes('text/')) {
      return <FiFileText className="w-6 h-6 text-red-600" aria-hidden="true" />;
    }
    
    return <FiFile className="w-6 h-6 text-blue-600" aria-hidden="true" />;
  }, []);

  // File preview component
  const FilePreview = useCallback(({ file, index }: { file: File, index: number }) => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
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
          ) : uploadProgress !== undefined ? (
            <div className="w-10 h-5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <FiCheck className="w-5 h-5 text-green-600" aria-hidden="true" />
              {allowRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                  aria-label={`Supprimer ${file.name}`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [uploading, uploadProgress, allowRemove, removeFile, getFileIcon]);

  // Render preview of files
  const renderFilePreview = useMemo(() => {
    if (!showPreview || files.length === 0) return null;
    
    return (
      <motion.div 
        className="mt-3 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence>
          {files.map((file, index) => (
            <FilePreview key={`${file.name}-${index}`} file={file} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }, [files, showPreview, FilePreview]);

  // Format accept string for display
  const acceptedFormatsString = useMemo(() => {
    if (!accept) return 'Tous les fichiers';
    
    return Object.values(accept)
      .flat()
      .map(ext => ext.replace(/^\./, '').toUpperCase())
      .join(', ');
  }, [accept]);

  // If children are provided, use them instead of default content
  if (children) {
    return (
      <div className={classNames("w-full", className)}>
        <div
          {...getRootProps()}
          className={classNames(
            isDragging ? 'border-indigo-400 bg-indigo-50' : ''
          )}
        >
          <input {...getInputProps()} aria-label="Upload file input" />
          {children}
        </div>
        
        {renderFilePreview}
        
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center mt-2 text-sm text-red-600"
              role="alert"
            >
              <FiAlertCircle className="mr-1.5 flex-shrink-0" aria-hidden="true" />
              <span>{fileError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render minimal variant (just a button)
  if (variant === 'minimal') {
    return (
      <div className={classNames("w-full", className)}>
        <div {...getRootProps({ className: "inline-block" })}>
          <input {...getInputProps()} aria-label="Upload file input" />
          <button 
            type="button"
            onClick={open}
            disabled={disabled}
            className={classNames(
              "inline-flex items-center px-3 py-2 border rounded-md",
              "text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              disabled 
                ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                : "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
            )}
            aria-disabled={disabled}
          >
            <FiUploadCloud className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {multiple ? 'Ajouter des fichiers' : 'Ajouter un fichier'}
          </button>
        </div>
        
        {renderFilePreview}
        
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center mt-2 text-sm text-red-600"
              role="alert"
            >
              <FiAlertCircle className="mr-1.5 flex-shrink-0" aria-hidden="true" />
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
      <div className={classNames("w-full", className)}>
        <div
          {...getRootProps()}
          className={classNames(
            "relative rounded-lg transition-all duration-200 touch-manipulation",
            "border-2 border-dashed",
            isDragging 
              ? "border-indigo-400 bg-indigo-50" 
              : "border-gray-300 bg-gray-50 hover:border-indigo-300"
          )}
        >
          <input {...getInputProps()} aria-label="Upload file input" />
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <button 
              type="button"
              onClick={open}
              disabled={disabled}
              className={classNames(
                "mb-2 inline-flex items-center px-3 py-2 border border-transparent rounded-md",
                "text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                disabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
              aria-disabled={disabled}
            >
              <FiUploadCloud className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {multiple ? 'Choisir des fichiers' : 'Choisir un fichier'}
            </button>
            <p className="text-xs text-gray-500">
              {acceptedFormatsString} jusqu'à {formatFileSize(maxSize)}
            </p>
          </div>
          
          <AnimatePresence>
            {isDragging && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: DRAG_OVERLAY_OPACITY }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-indigo-50 rounded-lg flex items-center justify-center"
              >
                <div className="text-center p-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiUploadCloud className="h-8 w-8 text-indigo-600 mx-auto" aria-hidden="true" />
                  </motion.div>
                  <p className="text-sm font-medium text-indigo-800 mt-2">
                    {multiple ? 'Déposer les fichiers ici' : 'Déposer le fichier ici'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {renderFilePreview}
        
        <AnimatePresence>
          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center mt-2 text-sm text-red-600"
              role="alert"
            >
              <FiAlertCircle className="mr-1.5 flex-shrink-0" aria-hidden="true" />
              <span>{fileError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render default variant
  return (
    <div className={classNames("w-full", className)}>
      <div
        {...getRootProps()}
        className={classNames(
          "transition-all duration-200 ease-in-out relative border-2 border-dashed rounded-lg p-6 cursor-pointer text-center touch-manipulation",
          isDragging 
            ? "border-indigo-400 bg-indigo-50 border-solid" 
            : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50 active:bg-indigo-50",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      >
        <input {...getInputProps()} aria-label="Upload file input" />
        
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4">
          <div className="mb-3 sm:mb-0">
            <motion.div
              animate={{ scale: isDragging ? 1.2 : 1 }}
              transition={{ duration: ANIMATION_DURATION }}
              className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center"
            >
              <FiUploadCloud className="h-8 w-8 text-indigo-600" aria-hidden="true" />
            </motion.div>
          </div>
          
          <div className="text-sm sm:text-base">
            <p className="font-medium text-gray-900 mb-1">
              {isDragging 
                ? (multiple ? "Relâchez pour déposer les fichiers" : "Relâchez pour déposer le fichier")
                : disabled 
                  ? "Téléchargement désactivé" 
                  : (multiple ? "Glissez-déposez vos fichiers ici" : "Glissez-déposez votre fichier ici")
              }
            </p>
            <p className="text-gray-500 text-sm">
              ou <span className="text-indigo-600 font-medium">parcourez vos fichiers</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {multiple ? 'Formats acceptés: ' : 'Format accepté: '}
              {acceptedFormatsString}
              {' - '}Taille max: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
        
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-indigo-50 bg-opacity-80 flex items-center justify-center rounded-lg"
            >
              <div className="bg-white rounded-lg p-4 shadow-md border border-indigo-100">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mx-auto mb-2"
                >
                  <FiUploadCloud className="h-10 w-10 text-indigo-600 mx-auto" aria-hidden="true" />
                </motion.div>
                <p className="text-indigo-800 font-medium">
                  {multiple ? 'Déposez pour télécharger vos fichiers' : 'Déposez pour télécharger votre fichier'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {renderFilePreview}
      
      <AnimatePresence>
        {fileError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center mt-2 px-3 py-2 rounded-md bg-red-50 border border-red-100"
            role="alert"
          >
            <FiAlertCircle className="mr-1.5 flex-shrink-0 text-red-500" aria-hidden="true" />
            <span className="text-sm text-red-600">{fileError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Dropzone.displayName = 'Dropzone';

export default Dropzone;