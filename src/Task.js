import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Check, Trash2 } from 'lucide-react';
import CustomTagDropdown from './CustomTagDropdown';

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

const Task = ({ task, index, onToggleComplete, onDelete, onEdit, topTags = [], tags = [], onTagChange }) => (
  <Draggable draggableId={task.id.toString()} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`group rounded-lg p-3 mb-2 transition-all duration-200 ${
          task.completed 
            ? 'bg-gray-100 blur-[0.5px] hover:blur-none' 
            : 'bg-white hover:bg-gray-50'
        } border border-gray-100`}
      >
        <div className="mb-1 flex items-center">
          <CustomTagDropdown
            value={task.tag || ''}
            onChange={(newTag) => onTagChange(task.id, newTag)}
            options={tags}
            focusTags={topTags}
          />
        </div>
        <div className="flex justify-between items-start mb-2">
          <span 
            className={`text-sm font-bold flex-grow ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}
            onDoubleClick={() => onEdit(task)}
          >
            {task.title}
          </span>
          <span className="text-xs font-light text-gray-500 ml-4 bg-gray-100 p-1 rounded">{formatDuration(task.duration)}</span>
        </div>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onToggleComplete(task.id)} 
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-200 ${
              task.completed 
                ? 'border-gray-400 bg-gray-400 text-white hover:bg-white hover:text-gray-400' 
                : 'border-gray-300 text-gray-300 hover:border-gray-500 hover:text-gray-500'
            }`}
          >
            <Check size={12} />
          </button>
          <div className="invisible group-hover:visible">
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    )}
  </Draggable>
);

export default Task;