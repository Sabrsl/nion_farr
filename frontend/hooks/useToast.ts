import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Create a singleton toast service
const toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

// Use unique prefix and increment for generating IDs
let toastIdCounter = 0;
const generateId = () => `toast-${Date.now()}-${toastIdCounter++}`;

// Toast service methods
export const toast = {
  success: (message: string, options?: ToastOptions) => addToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => addToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) => addToast(message, 'info', options),
  warning: (message: string, options?: ToastOptions) => addToast(message, 'warning', options),
  dismiss: (id: string) => removeToast(id),
  dismissAll: () => {
    toasts.length = 0;
    notifyListeners();
  }
};

const addToast = (message: string, type: ToastType, options?: ToastOptions) => {
  const id = generateId();
  const duration = options?.duration || 5000;
  
  const newToast: Toast = {
    id,
    message,
    type,
    duration,
  };
  
  toasts.push(newToast);
  notifyListeners();
  
  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
};

const removeToast = (id: string) => {
  const index = toasts.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
    notifyListeners();
  }
};

/**
 * Hook for using the toast notification system
 * @returns Methods to show and manage toast notifications, and current toast state
 */
export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  // Add this component as a listener
  useCallback(() => {
    const listener = (updatedToasts: Toast[]) => {
      setCurrentToasts(updatedToasts);
    };
    
    listeners.push(listener);
    
    // Clean up listener on unmount
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  // Shorthand method for showing a toast
  const showToast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    return addToast(message, type, options);
  }, []);
  
  return {
    toasts: currentToasts,
    showToast,
    dismissToast: toast.dismiss,
    dismissAllToasts: toast.dismissAll,
    ...toast
  };
} 