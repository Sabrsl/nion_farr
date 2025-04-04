import React, { ReactNode } from 'react';
import { classNames } from '../../utils/helpers';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  type = 'button',
  fullWidth = false,
  disabled = false,
  className = '',
  onClick,
}) => {
  // Définir les classes de base
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Définir les classes pour les différentes variantes
  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent focus:ring-indigo-500',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-indigo-500',
    success: 'bg-green-600 hover:bg-green-700 text-white border border-transparent focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border border-transparent focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 text-white border border-transparent focus:ring-blue-500',
  };
  
  // Définir les classes pour les différentes tailles
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  // Définir les classes pour le mode désactivé
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Définir les classes pour la largeur
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combiner toutes les classes
  const buttonClasses = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    widthClasses,
    className
  );
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && (
        <span className="mr-2 -ml-1">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button; 