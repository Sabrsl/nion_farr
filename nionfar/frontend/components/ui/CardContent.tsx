import React, { ReactNode } from 'react';
import classNames from 'classnames';

export interface CardContentProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  padding = 'medium',
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'px-2 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const classes = classNames(paddingClasses[padding], className);

  return <div className={classes}>{children}</div>;
};

export default CardContent; 