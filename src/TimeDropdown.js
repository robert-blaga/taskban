import React, { useState, useRef, useEffect } from 'react';

const durationOptions = [
  5, 10, 15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480
];

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

const TimeDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="cursor-pointer text-xs bg-gray-100 px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {formatDuration(value)}
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg right-0">
          <div className="py-1">
            {durationOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {formatDuration(option)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;
