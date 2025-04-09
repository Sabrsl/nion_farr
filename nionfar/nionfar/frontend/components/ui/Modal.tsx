import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi/index.js';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  preventScrollOnOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  className = '',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  preventScrollOnOpen = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen && preventScrollOnOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, preventScrollOnOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, closeOnEscape]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        closeOnBackdropClick && 
        modalRef.current && 
        !modalRef.current.contains(e.target as Node) && 
        isOpen
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, closeOnBackdropClick]);

  // Ensure component is mounted for proper animation
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'md': return 'max-w-lg';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case 'full': return 'max-w-full mx-4';
      default: return 'max-w-lg';
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeOnBackdropClick ? onClose : undefined}
            />

            {/* Modal content */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`relative transform rounded-lg bg-white text-left shadow-xl transition-all ${getSizeClass()} ${className} w-full`}
              role="document"
            >
              {/* Close button */}
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
                onClick={onClose}
                aria-label="Fermer"
              >
                <FiX className="h-5 w-5" />
              </button>

              {/* Title */}
              {title && (
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                </div>
              )}

              {/* Content */}
              <div className={`${!title ? 'pt-6' : 'py-4'} px-6`}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="border-t border-gray-200 px-6 py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;