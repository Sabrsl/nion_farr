import { useState, useRef, useEffect } from 'react';

export const useTooltip = () => {
  const [showTooltipText, setShowTooltipText] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltipText(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef]);

  return {
    tooltipRef,
    showTooltipText,
    setShowTooltipText
  };
}; 