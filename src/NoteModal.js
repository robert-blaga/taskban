import React, { useState, useEffect, useRef } from 'react';

const NoteModal = ({ isOpen, onClose, onSave, initialNote }) => {
  const [note, setNote] = useState(initialNote || '');
  const modalRef = useRef(null);

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote]);

  const handleChange = (event) => {
    const content = event.target.value;
    setNote(content);
    onSave(content);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="bg-white p-6 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          className="w-full h-64 p-2 rounded resize-none focus:outline-none bg-gray-100"
          value={note}
          onChange={handleChange}
          placeholder="..."
        />
      </div>
    </div>
  );
};

export default NoteModal;
