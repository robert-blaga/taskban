import React, { useState, useEffect, useRef } from 'react';
import CustomTagDropdown from './CustomTagDropdown';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './BlockNoteCustom.css';
import CustomSideMenu from './CustomSideMenu';

const customTheme = {
  colors: {
    editor: {
      text: "#000000", // Black text
      background: "#ffffff", // White background
    },
    menu: {
      text: "#000000", // Black text
      background: "#ffffff", // White background
    },
    tooltip: {
      text: "#000000", // Black text
      background: "#efefef", // Light gray background
    },
    hovered: {
      text: "#000000", // Black text
      background: "#efefef", // Light gray background
    },
    selected: {
      text: "#ffffff", // White text
      background: "#3f3f3f", // Dark gray background
    },
    disabled: {
      text: "#afafaf", // Light gray text
      background: "#efefef", // Light gray background
    },
    shadow: "#cfcfcf", // Light gray shadow
    border: "#efefef", // Light gray border
    sideMenu: "#cfcfcf", // Light gray side menu
    highlights: {
      gray: {
        text: "#9b9a97",
        background: "#ebeced",
      },
      brown: {
        text: "#64473a",
        background: "#e9e5e3",
      },
      red: {
        text: "#e03e3e",
        background: "#fbe4e4",
      },
      orange: {
        text: "#d9730d",
        background: "#f6e9d9",
      },
      yellow: {
        text: "#dfab01",
        background: "#fbf3db",
      },
      green: {
        text: "#4d6461",
        background: "#ddedea",
      },
      blue: {
        text: "#0b6e99",
        background: "#ddebf1",
      },
      purple: {
        text: "#6940a5",
        background: "#eae4f2",
      },
      pink: {
        text: "#ad1a72",
        background: "#f4dfeb",
      },
    },
  },
  borderRadius: 6,
  fontFamily: "Inter, 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Open Sans', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const NoteModal = ({ isOpen, onClose, onSave, initialNote, task, tags, topTags, onTagChange }) => {
  const [noteContent, setNoteContent] = useState(initialNote || '');
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const modalRef = useRef(null);
  const titleInputRef = useRef(null);

  const editor = useCreateBlockNote({
    content: noteContent,
    onChange: (newContent) => setNoteContent(newContent),
  });

  useEffect(() => {
    setNoteContent(initialNote || '');
    setEditedTitle(task.title);
  }, [initialNote, task.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleSubmit = () => {
    if (editedTitle.trim() !== '') {
      onSave({ ...task, title: editedTitle.trim() });
      setIsEditingTitle(false);
    } else {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-default"
      onClick={handleClickOutside}
    >
      <div 
        ref={modalRef}
        className="bg-white p-6 rounded-lg w-[369px] h-[660px] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={editedTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleSubmit}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold mb-4 w-full bg-transparent focus:outline-none cursor-text"
          />
        ) : (
          <h2 
            className="text-2xl font-bold mb-4 cursor-pointer"
            onClick={handleTitleClick}
          >
            {task.title}
          </h2>
        )}
        
        <hr className="my-4 border-gray-200" />

        <div className="mb-4 space-y-1">
          <div className="flex">
            <span className="text-gray-400 text-xs w-24">Estimate</span>
            <span className="text-gray-600 text-xs">{formatTime(task.duration)}</span>
          </div>
          <div className="flex">
            <span className="text-gray-400 text-xs w-24">Date added</span>
            <span className="text-gray-600 text-xs">{formatDate(task.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 text-xs w-24">Area</span>
            <CustomTagDropdown
              value={task.tag || ''}
              onChange={(newTag) => onTagChange(task.id, newTag)}
              options={tags}
              focusTags={topTags}
              isFocusTag={topTags.includes(task.tag)}
            />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-1">Notes</h3>
          <div className="custom-editor-container">
            <BlockNoteView 
              editor={editor} 
              theme={customTheme} 
              sideMenu={(props) => <CustomSideMenu {...props} />}
              className="aligned-editor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
