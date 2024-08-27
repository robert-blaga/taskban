import React, { useState, useRef, useEffect } from 'react';
import { Target, DollarSign, Bird, Landmark, Clipboard, Plug, FileCode, PiggyBank, Users, PhoneCall, Book, ChevronDown } from 'lucide-react';

const getTagIcon = (tag) => {
  const lowercaseTag = tag.toLowerCase();
  if (lowercaseTag.includes('sales')) return <DollarSign size={14} />;
  if (lowercaseTag.includes('marketing')) return <Bird size={14} />;
  if (lowercaseTag.includes('fundraising')) return <Landmark size={14} />;
  if (lowercaseTag.includes('admin')) return <Clipboard size={14} />;
  if (lowercaseTag.includes('operations')) return <Plug size={14} />;
  if (lowercaseTag.includes('development')) return <FileCode size={14} />;
  if (lowercaseTag.includes('finance')) return <PiggyBank size={14} />;
  if (lowercaseTag.includes('hr') || lowercaseTag.includes('human resources')) return <Users size={14} />;
  if (lowercaseTag.includes('customer support') || lowercaseTag.includes('customer service')) return <PhoneCall size={14} />;
  return <Book size={14} />; // Default icon
};

const CustomTagDropdown = ({ value, onChange, options, focusTags = [] }) => {
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

  const isInFocus = (tag) => focusTags.includes(tag);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`cursor-pointer text-xs flex items-center ${
          isInFocus(value) ? 'text-green-500' : 'text-gray-500'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? (
          <>
            {getTagIcon(value)}
            <span className="ml-1">{value}</span>
          </>
        ) : (
          <>
            <Target size={14} />
            <span className="ml-1">No Tag</span>
          </>
        )}
        <ChevronDown size={14} className="ml-1" />
      </div>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-32 bg-white rounded-md shadow-lg">
          <div className="py-1">
            <div
              className="px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
            >
              <Target size={14} className="mr-2" />
              <span>No Tag</span>
            </div>
            {options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 text-xs hover:bg-gray-100 cursor-pointer flex items-center ${
                  isInFocus(option) ? 'text-green-500' : 'text-gray-700'
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {getTagIcon(option)}
                <span className="ml-2">{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTagDropdown;
