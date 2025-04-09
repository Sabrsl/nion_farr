import React, { ReactNode } from 'react';
import classNames from 'classnames';

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'between';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = '',
  padding = 'medium',
  divider = false,
  align = 'between',
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'px-2 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const classes = classNames(
    'flex items-center',
    alignClasses[align],
    paddingClasses[padding],
    {
      'border-b border-gray-200 dark:border-gray-800': divider,
    },
    className
  );

  return (
    <div className={classes}>
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div>
          {title && (
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default CardHeader; 