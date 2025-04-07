import React, { ReactNode, memo } from 'react';
import { FiAlertTriangle, FiInfo, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import classNames from 'classnames';

export interface AlertProps {
  variant: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string | ReactNode;
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: ReactNode;
  dismissible?: boolean;
}

type VariantConfig = {
  container: string;
  icon: ReactNode;
  title: string;
  message: string;
  button: string;
  buttonHover: string;
  ring: string;
};

/**
 * Alert component for displaying contextual feedback messages
 */
export const Alert = memo<AlertProps>(({
  variant,
  title,
  message,
  actions,
  onClose,
  className = '',
  icon,
  dismissible = !!onClose,
  ...rest
}) => {
  // Configuration styles for each variant
  const VARIANT_STYLES: Record<AlertProps['variant'], VariantConfig> = {
    info: {
      container: 'bg-blue-50 border-blue-300',
      icon: <FiInfo className="h-5 w-5 text-blue-500" aria-hidden="true" />,
      title: 'text-blue-800',
      message: 'text-blue-700',
      button: 'text-blue-500',
      buttonHover: 'hover:bg-blue-100',
      ring: 'focus:ring-blue-600'
    },
    success: {
      container: 'bg-green-50 border-green-300',
      icon: <FiCheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
      title: 'text-green-800',
      message: 'text-green-700',
      button: 'text-green-500',
      buttonHover: 'hover:bg-green-100',
      ring: 'focus:ring-green-600'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-300',
      icon: <FiAlertCircle className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      button: 'text-yellow-500',
      buttonHover: 'hover:bg-yellow-100',
      ring: 'focus:ring-yellow-600'
    },
    error: {
      container: 'bg-red-50 border-red-300',
      icon: <FiAlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />,
      title: 'text-red-800',
      message: 'text-red-700',
      button: 'text-red-500',
      buttonHover: 'hover:bg-red-100',
      ring: 'focus:ring-red-600'
    }
  };
  
  const styles = VARIANT_STYLES[variant];

  return (
    <div 
      className={classNames(
        'rounded-md border p-4',
        styles.container,
        className
      )}
      role="alert"
      aria-live="polite"
      {...rest}
    >
      <div className="flex">
        {/* Alert icon */}
        <div className="flex-shrink-0">
          {icon || styles.icon}
        </div>
        
        {/* Alert content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={classNames('text-sm font-medium', styles.title)}>
              {title}
            </h3>
          )}
          
          <div className={classNames('text-sm', styles.message, { 'mt-2': !!title })}>
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
          
          {/* Optional action buttons */}
          {actions && (
            <div className="mt-4">
              {actions}
            </div>
          )}
        </div>
        
        {/* Close button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={classNames(
                  'inline-flex rounded-md p-1.5',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  'transition-colors',
                  styles.button,
                  styles.buttonHover,
                  styles.ring
                )}
                onClick={onClose}
                aria-label="Fermer"
              >
                <span className="sr-only">Fermer</span>
                <FiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Display name for React DevTools
Alert.displayName = 'Alert';

export default Alert;