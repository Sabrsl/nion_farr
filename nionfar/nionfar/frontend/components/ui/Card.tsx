import React, { ReactNode, forwardRef } from 'react';
import classNames from 'classnames';

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'none' | 'small' | 'medium' | 'large';
  onClick?: () => void;
  href?: string;
  as?: React.ElementType;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  fullWidth?: boolean;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      padding = 'medium',
      radius = 'medium',
      onClick,
      href,
      as: Component = 'div',
      shadow = 'none',
      border = true,
      fullWidth = false,
      hoverable = false,
    },
    ref
  ) => {
    const baseClasses = 'overflow-hidden transition-all duration-200';
    
    const variantClasses = {
      default: '',
      outlined: 'border',
      elevated: 'shadow-md',
    };
    
    const paddingClasses = {
      none: 'p-0',
      small: 'p-2',
      medium: 'p-4',
      large: 'p-6',
    };
    
    const radiusClasses = {
      none: 'rounded-none',
      small: 'rounded',
      medium: 'rounded-md',
      large: 'rounded-lg',
    };
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    };
    
    const classes = classNames(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      radiusClasses[radius],
      shadowClasses[shadow],
      {
        'border-gray-200 dark:border-gray-800': border,
        'w-full': fullWidth,
        'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer': hoverable,
        'bg-white dark:bg-gray-900': variant !== 'outlined',
      },
      className
    );
    
    if (href) {
      return (
        <a href={href} className={classes} onClick={onClick} ref={ref as any}>
          {children}
        </a>
      );
    }
    
    return (
      <Component className={classes} onClick={onClick} ref={ref}>
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';

export default Card; 