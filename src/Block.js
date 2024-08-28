import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './BlockNoteCustom.css'; // Import custom CSS

const Block = () => {
  const [isOpen, setIsOpen] = useState(false);
  const editor = useCreateBlockNote();

  const toggleBlock = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed top-0 right-0 h-full flex items-center z-50">
      <button
        onClick={toggleBlock}
        className="bg-gray-200 hover:bg-gray-300 p-2 rounded-l-md focus:outline-none absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full z-10"
      >
        {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </button>
      <div
        className={`bg-white h-full transition-all duration-300 ease-in-out ${
          isOpen ? 'w-96' : 'w-0'
        } overflow-hidden shadow-lg`}
      >
        {isOpen && (
          <div className="custom-editor-container">
            <BlockNoteView editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Block;
