import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  variant?: 'default' | 'light' | 'dark';
  trigger?: 'hover' | 'click';
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  variant = 'default',
  trigger = 'hover',
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized position classes
  const positionClasses = useMemo(() => ({
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
  }), []);

  // Memoized arrow classes
  const arrowClasses = useMemo(() => ({
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-l-4 border-r-4 border-t-4 border-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-l-4 border-r-4 border-b-4 border-transparent',
    left: 'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent',
    right: 'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent',
  }), []);

  // Variant-specific styles
  const variantStyles = useMemo(() => ({
    default: {
      tooltip: 'bg-gray-800 text-white',
      arrow: 'border-gray-800'
    },
    light: {
      tooltip: 'bg-white text-gray-800 border border-gray-200 shadow-lg',
      arrow: 'border-gray-200'
    },
    dark: {
      tooltip: 'bg-black text-white',
      arrow: 'border-black'
    }
  }), []);

  // Show tooltip
  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  // Toggle tooltip for click trigger
  const toggleTooltip = () => {
    if (disabled) return;
    setIsVisible(prev => !prev);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Event handlers based on trigger type
  const eventHandlers = trigger === 'hover'
    ? { 
        onMouseEnter: showTooltip, 
        onMouseLeave: hideTooltip 
      }
    : { 
        onClick: toggleTooltip 
      };

  // Compute tooltip classes
  const tooltipClasses = `
    absolute z-50 px-2 py-1 text-xs font-medium rounded-md shadow-sm whitespace-nowrap max-w-xs
    ${positionClasses[position]}
    ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
    transition-opacity duration-200
    ${variantStyles[variant].tooltip}
    ${className}
  `;

  // Compute arrow classes
  const computedArrowClasses = `
    absolute w-0 h-0 
    ${arrowClasses[position]}
    ${variantStyles[variant].arrow}
  `;

  return (
    <div 
      className="relative inline-flex" 
      {...eventHandlers}
      ref={targetRef}
    >
      {children}
      
      {content && (
        <div 
          className={tooltipClasses} 
          ref={tooltipRef}
          role="tooltip"
        >
          {content}
          <span className={computedArrowClasses} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;