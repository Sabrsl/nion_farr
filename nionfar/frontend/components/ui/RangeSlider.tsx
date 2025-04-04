import React, { useEffect, useState, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  values: number[];
  onChange: (values: number[]) => void;
  formatLabel?: (value: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  values,
  onChange,
  formatLabel = (value) => value.toString(),
}) => {
  const [localValues, setLocalValues] = useState(values);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Update local values when props change
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const handleMouseDown = (handle: 'min' | 'max') => {
    setDragging(handle);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !trackRef.current) return;

      const track = trackRef.current;
      const trackRect = track.getBoundingClientRect();
      const trackWidth = trackRect.width;
      
      // Calculate the new position as a percentage
      let position = Math.max(0, Math.min(1, (e.clientX - trackRect.left) / trackWidth));
      
      // Convert the percentage to a value within our range
      const newValue = Math.round(min + position * (max - min));
      
      // Update the appropriate handle
      let newValues = [...localValues];
      if (dragging === 'min') {
        newValues[0] = Math.min(newValue, newValues[1] - 1);
      } else {
        newValues[1] = Math.max(newValue, newValues[0] + 1);
      }
      
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
  }, [dragging, localValues, min, max, onChange]);

  // Calculate percentages for handle positions
  const minHandlePercent = ((localValues[0] - min) / (max - min)) * 100;
  const maxHandlePercent = ((localValues[1] - min) / (max - min)) * 100;

  return (
    <div className="relative h-2 w-full">
      {/* Track background */}
      <div
        ref={trackRef}
        className="absolute h-1 w-full bg-gray-200 rounded-full top-1/2 transform -translate-y-1/2"
      ></div>

      {/* Active track part */}
      <div
        className="absolute h-1 bg-indigo-500 rounded-full top-1/2 transform -translate-y-1/2"
        style={{ left: `${minHandlePercent}%`, right: `${100 - maxHandlePercent}%` }}
      ></div>

      {/* Min handle */}
      <div
        className={`absolute w-6 h-6 rounded-full bg-white border-2 border-indigo-500 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab ${dragging === 'min' ? 'cursor-grabbing shadow-lg' : ''}`}
        style={{ left: `${minHandlePercent}%` }}
        onMouseDown={() => handleMouseDown('min')}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={localValues[0]}
      ></div>

      {/* Max handle */}
      <div
        className={`absolute w-6 h-6 rounded-full bg-white border-2 border-indigo-500 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab ${dragging === 'max' ? 'cursor-grabbing shadow-lg' : ''}`}
        style={{ left: `${maxHandlePercent}%` }}
        onMouseDown={() => handleMouseDown('max')}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={localValues[1]}
      ></div>
    </div>
  );
}; 