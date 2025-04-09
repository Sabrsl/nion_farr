import React, { useEffect, useState, useRef, useCallback } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  values: number[];
  onChange: (values: number[]) => void;
  formatLabel?: (value: number) => string;
  step?: number;
  disabled?: boolean;
  color?: string;
  showLabels?: boolean;
  className?: string;
  ariaLabelMin?: string;
  ariaLabelMax?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  values,
  onChange,
  formatLabel = (value) => value.toString(),
  step = 1,
  disabled = false,
  color = 'indigo',
  showLabels = false,
  className = '',
  ariaLabelMin = 'Minimum value',
  ariaLabelMax = 'Maximum value'
}) => {
  const [localValues, setLocalValues] = useState(values);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate initial values
  useEffect(() => {
    const [minVal, maxVal] = values;
    if (minVal < min || maxVal > max || minVal >= maxVal) {
      console.warn(`Invalid range values. Adjusting to fit min: ${min}, max: ${max}`);
      const adjustedValues = [
        Math.max(min, Math.min(minVal, max - step)),
        Math.min(max, Math.max(maxVal, min + step))
      ];
      onChange(adjustedValues);
    }
  }, [min, max, values, step, onChange]);

  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const calculateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return min;

    const track = trackRef.current;
    const trackRect = track.getBoundingClientRect();
    const trackWidth = trackRect.width;
    
    // Calculate the new position as a percentage
    let position = Math.max(0, Math.min(1, (clientX - trackRect.left) / trackWidth));
    
    // Convert the percentage to a value within our range
    const rawValue = min + position * (max - min);
    
    // Round to the nearest step
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  const handleMouseDown = (handle: 'min' | 'max') => {
    if (disabled) return;
    setDragging(handle);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !trackRef.current) return;

      const newValue = calculateValue(e.clientX);
      
      // Update the appropriate handle
      let newValues = [...localValues];
      if (dragging === 'min') {
        newValues[0] = Math.min(newValue, newValues[1] - step);
      } else {
        newValues[1] = Math.max(newValue, newValues[0] + step);
      }
      
      // Ensure values are within range
      newValues[0] = Math.max(min, Math.min(newValues[0], max));
      newValues[1] = Math.min(max, Math.max(newValues[1], min));
      
      setLocalValues(newValues);
    };

    const handleMouseUp = () => {
      if (dragging) {
        onChange(localValues);
        setDragging(null);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, localValues, min, max, step, onChange, calculateValue]);

  // Calculate percentages for handle positions
  const minHandlePercent = ((localValues[0] - min) / (max - min)) * 100;
  const maxHandlePercent = ((localValues[1] - min) / (max - min)) * 100;

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{formatLabel(localValues[0])}</span>
          <span>{formatLabel(localValues[1])}</span>
        </div>
      )}

      {/* Slider Container */}
      <div className="relative h-2 w-full">
        {/* Track background */}
        <div
          ref={trackRef}
          className={`absolute h-1 w-full bg-${color}-200 rounded-full top-1/2 transform -translate-y-1/2`}
        ></div>

        {/* Active track part */}
        <div
          className={`absolute h-1 bg-${color}-500 rounded-full top-1/2 transform -translate-y-1/2`}
          style={{ left: `${minHandlePercent}%`, right: `${100 - maxHandlePercent}%` }}
        ></div>

        {/* Min handle */}
        <div
          className={`
            absolute w-6 h-6 rounded-full bg-white border-2 border-${color}-500 
            top-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} 
            ${dragging === 'min' && !disabled ? 'cursor-grabbing shadow-lg' : ''}
          `}
          style={{ left: `${minHandlePercent}%` }}
          onMouseDown={() => handleMouseDown('min')}
          role="slider"
          aria-label={ariaLabelMin}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValues[0]}
          aria-disabled={disabled}
        ></div>

        {/* Max handle */}
        <div
          className={`
            absolute w-6 h-6 rounded-full bg-white border-2 border-${color}-500 
            top-1/2 transform -translate-x-1/2 -translate-y-1/2 
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} 
            ${dragging === 'max' && !disabled ? 'cursor-grabbing shadow-lg' : ''}
          `}
          style={{ left: `${maxHandlePercent}%` }}
          onMouseDown={() => handleMouseDown('max')}
          role="slider"
          aria-label={ariaLabelMax}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValues[1]}
          aria-disabled={disabled}
        ></div>
      </div>
    </div>
  );
};

export default RangeSlider;