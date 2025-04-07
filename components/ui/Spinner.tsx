import React from 'react';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray' | 'success' | 'error';
  className?: string;
  label?: string;
  variant?: 'default' | 'dots' | 'ring';
  speed?: 'slow' | 'normal' | 'fast';
  testId?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  label,
  variant = 'default',
  speed = 'normal',
  testId = 'loading-spinner'
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const colorClasses = {
    primary: 'text-indigo-600',
    white: 'text-white',
    gray: 'text-gray-500',
    success: 'text-green-500',
    error: 'text-red-500'
  };

  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast'
  };

  const renderDefaultSpinner = () => (
    <svg
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        ${speedClasses[speed]}
      `}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      data-testid={testId}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const renderDotsSpinner = () => (
    <div 
      className={`
        flex items-center justify-center 
        ${sizeClasses[size]} 
        ${colorClasses[color]}
      `}
      data-testid={testId}
    >
      <div className="flex space-x-1">
        <div className={`h-2 w-2 rounded-full animate-bounce ${colorClasses[color]}`}></div>
        <div className={`h-2 w-2 rounded-full animate-bounce delay-100 ${colorClasses[color]}`}></div>
        <div className={`h-2 w-2 rounded-full animate-bounce delay-200 ${colorClasses[color]}`}></div>
      </div>
    </div>
  );

  const renderRingSpinner = () => (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-4 border-current border-t-transparent rounded-full animate-spin
      `}
      data-testid={testId}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return renderDotsSpinner();
      case 'ring':
        return renderRingSpinner();
      default:
        return renderDefaultSpinner();
    }
  };

  return (
    <div 
      className={`flex items-center justify-center ${className}`} 
      role="status"
    >
      <div className="flex flex-col items-center">
        {renderSpinner()}
        {label && (
          <span 
            className={`
              mt-2 text-sm 
              ${color === 'white' ? 'text-white' : 'text-gray-600'}
            `}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default Spinner;

// Configuration Tailwind CSS à ajouter
const tailwindConfig = `
module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite'
      }
    }
  }
}
`;