import React, { useState, useRef, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Check, StickyNote, Trash2 } from 'lucide-react';
import CustomTagDropdown from './CustomTagDropdown';
import TimeDropdown from './TimeDropdown';
import NoteModal from './NoteModal';

const Task = ({ task, index, onToggleComplete, onDelete, onEdit, topTags = [], tags = [], onTagChange, onDurationChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTitleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedTitle.trim() !== '') {
      onEdit(task.id, { title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() !== '') {
      onEdit(task.id, { title: editedTitle.trim() });
    } else {
      setEditedTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleSaveNote = (newNote) => {
    onEdit(task.id, { note: newNote });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowContextMenu(false);
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group rounded-lg p-3 mb-2 transition-all duration-200 ${
            task.completed 
              ? 'bg-gray-100 blur-[0.5px] hover:blur-none' 
              : 'bg-white'
          } border hover:border-gray-300 ${
            task.completed ? 'border-gray-100' : 'border-gray-100'
          }`}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={handleContextMenu}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex-grow">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTitleSubmit(e);
                      }
                    }}
                    className="text-sm font-bold bg-transparent focus:outline-none p-0 m-0 w-full"
                  />
                ) : (
                  <span 
                    className={`text-sm font-bold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                    onClick={handleTitleClick}
                  >
                    {task.title}
                  </span>
                )}
              </div>
              <TimeDropdown
                value={task.duration}
                onChange={(newDuration) => onDurationChange(task.id, newDuration)}
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }} 
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 ${
                    task.completed 
                      ? 'border-gray-400 bg-gray-400 text-white hover:bg-white hover:text-gray-400' 
                      : 'border-gray-300 text-gray-300 hover:border-gray-500 hover:text-gray-500'
                  }`}
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <StickyNote size={16} />
                </button>
              </div>
              <CustomTagDropdown
                value={task.tag || ''}
                onChange={(newTag) => onTagChange(task.id, newTag)}
                options={tags}
                focusTags={topTags}
                isFocusTag={topTags.includes(task.tag)}
              />
            </div>
          </div>
          <NoteModal
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            onSave={handleSaveNote}
            initialNote={task.note}
          />
          {showContextMenu && (
            <div
              ref={contextMenuRef}
              className="fixed bg-white shadow-lg rounded-md py-2 z-50"
              style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Task;