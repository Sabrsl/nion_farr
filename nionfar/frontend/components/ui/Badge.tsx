import React, { memo } from 'react';
import classNames from 'classnames';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  title?: string;
}

/**
 * Badge component for displaying small counts, labels, or statuses
 */
export const Badge = memo<BadgeProps>(({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className = '',
  onClick,
  title,
  ...rest
}) => {
  // Define variant styles as constants
  const VARIANTS = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  // Define size styles
  const SIZES = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  // Build classes with classNames for better readability
  const badgeClasses = classNames(
    // Base styles
    'inline-flex items-center justify-center font-medium',
    
    // Variant styles
    VARIANTS[variant],
    
    // Size styles
    SIZES[size],
    
    // Shape styles
    rounded ? 'rounded-full' : 'rounded-md',
    
    // Interactive styles - add cursor-pointer when onClick is provided
    {
      'cursor-pointer hover:opacity-90': !!onClick
    },
    
    // Custom classes
    className
  );
  
  return (
    <span 
      className={badgeClasses}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {children}
    </span>
  );
});

// Display name for React DevTools
Badge.displayName = 'Badge';

export default Badge;