import React, { ReactNode } from 'react';
import classNames from 'classnames';

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  divider?: boolean;
  align?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  padding = 'medium',
  divider = true,
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
      'border-t border-gray-200 dark:border-gray-800': divider,
    },
    className
  );

  return <div className={classes}>{children}</div>;
};

export default CardFooter; 