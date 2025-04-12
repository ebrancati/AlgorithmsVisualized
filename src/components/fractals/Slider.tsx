import React from 'react';

interface Marker {
  value: number;
  label: string;
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  markers?: Marker[];
  unit?: string;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  markers = [],
  unit = "",
  className = ""
}) => {
  // Calculate the exact position based on the proportion of the value
  const calculatePosition = (val: number): string => {
    return `${((val - min) / (max - min)) * 100}%`;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
  };
  
  return (
    <div className={`mb-6 ${className}`}>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label}: {value}{unit}
      </label>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative w-full h-6 mt-1">
          {markers.map((marker, index) => (
            <div 
              key={index} 
              className="absolute -translate-x-1/2 text-xs text-gray-500"
              style={{ left: calculatePosition(marker.value) }}
            >
              {marker.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider;