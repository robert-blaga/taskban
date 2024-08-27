import React, { useState, useEffect, useRef } from 'react';
import CustomDropdown from './CustomDropdown';

const TaskDialog = ({ isOpen, onClose, onSubmit, initialTask, tags, onNewTag }) => {
  const [taskName, setTaskName] = useState('');
  const [taskTag, setTaskTag] = useState('');
  const [taskDuration, setTaskDuration] = useState('30');
  const taskNameInputRef = useRef(null);
  const dialogRef = useRef(null);

  const durationOptions = [
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '300', label: '5 hours' },
    { value: '360', label: '6 hours' },
    { value: '420', label: '7 hours' },
    { value: '480', label: '8 hours' },
  ];

  const tagOptions = [
    { value: '#notag', label: 'No Tag' },
    ...tags.map(tag => ({ value: tag, label: tag })),
    { value: 'new', label: '+ Add New Tag' }
  ];

  useEffect(() => {
    if (initialTask) {
      setTaskName(initialTask.title);
      setTaskTag(initialTask.tag || '#notag');
      setTaskDuration(initialTask.duration.toString());
    } else {
      setTaskName('');
      setTaskTag('#notag');
      setTaskDuration('30');
    }
    if (isOpen && taskNameInputRef.current) {
      taskNameInputRef.current.focus();
    }
  }, [initialTask, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onSubmit({
        id: initialTask ? initialTask.id : Date.now(),
        title: taskName.trim(),
        tag: taskTag === '#notag' ? '' : taskTag,
        duration: parseInt(taskDuration),
        completed: initialTask ? initialTask.completed : false
      });
      onClose();
    }
  };

  const handleTagChange = (value) => {
    if (value === 'new') {
      const newTag = prompt('Enter a new tag name:');
      if (newTag && !tags.includes(newTag)) {
        onNewTag(newTag);
        setTaskTag(newTag);
      }
    } else {
      setTaskTag(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={dialogRef} className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <form onSubmit={handleSubmit}>
          <input
            ref={taskNameInputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Task name"
            className="w-full p-2 mb-2 bg-gray-100 rounded text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <div className="mb-2">
            <CustomDropdown
              options={tagOptions}
              value={taskTag}
              onChange={handleTagChange}
            />
          </div>
          <div className="mb-4">
            <CustomDropdown
              options={durationOptions}
              value={taskDuration}
              onChange={setTaskDuration}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors duration-200"
            >
              {initialTask ? 'Update' : 'Add'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDialog;