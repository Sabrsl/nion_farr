import React, { ReactNode, memo, forwardRef } from 'react';
import classNames from 'classnames';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  ariaLabel?: string;
  ariaDescribedby?: string;
}

/**
 * Button component that can be used throughout the application
 * with different variants, sizes, and additional features like loading state.
 */
export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  startIcon,
  endIcon,
  onClick,
  children,
  ariaLabel,
  ariaDescribedby,
  ...rest
}, ref) => {
  // Define the size classes
  const SIZES = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Define the variant classes
  const VARIANTS = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-indigo-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
  };
  
  // Use classNames utility for cleaner class composition
  const buttonClasses = classNames(
    // Base classes
    'inline-flex items-center justify-center rounded-md font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    // Size classes
    SIZES[size],
    
    // Variant classes
    VARIANTS[variant],
    
    // Conditional classes
    {
      'opacity-50 cursor-not-allowed': loading || disabled,
      'relative': loading,
      'w-full': fullWidth,
    },
    
    // Custom classes
    className
  );
  
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-busy={loading}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg 
            className="animate-spin h-5 w-5 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      <span className={classNames('flex items-center', { 'invisible': loading })}>
        {startIcon && <span className="mr-2">{startIcon}</span>}
        {children}
        {endIcon && <span className="ml-2">{endIcon}</span>}
      </span>
    </button>
  );
}));

// Display name for React DevTools
Button.displayName = 'Button';

export default Button;