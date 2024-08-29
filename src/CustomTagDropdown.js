import React, { useState, useRef, useEffect } from 'react';
import { Target, DollarSign, Bird, Landmark, Clipboard, Plug, FileCode, PiggyBank, Users, PhoneCall, Book } from 'lucide-react';

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

const CustomTagDropdown = ({ value, onChange, options, focusTags, isFocusTag }) => {
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

  const handleChange = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const textColorClass = isFocusTag ? 'text-green-500' : 'text-gray-500';
  const iconColorClass = isFocusTag ? 'text-green-500' : 'text-gray-400';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 text-xs ${textColorClass} hover:bg-gray-100 rounded p-1`}
      >
        <span className={iconColorClass}>{getTagIcon(value)}</span>
        <span>{value}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {options.map((tag) => (
              <button
                key={tag}
                onClick={() => handleChange(tag)}
                className={`flex items-center px-4 py-2 text-xs ${focusTags.includes(tag) ? 'text-green-500' : 'text-gray-500'} w-full text-left hover:bg-gray-100`}
                role="menuitem"
              >
                <span className={focusTags.includes(tag) ? 'text-green-500' : 'text-gray-500'}>{getTagIcon(tag)}</span>
                <span className="ml-2">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTagDropdown;
