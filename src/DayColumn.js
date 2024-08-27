import React, { useState, useMemo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';

// Remove these lines if they exist:
// import { Plus } from 'lucide-react';
// import CustomDropdown from './CustomDropdown';

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
};

const DayColumn = ({ day, date, isToday, tasks, onAddTask, onToggleComplete, onDeleteTask, onEditTask, topTags = [], tags = [], onTagChange, onDurationChange }) => {
  const { totalDuration, focusPercentage, totalHours } = useMemo(() => {
    const total = tasks.reduce((sum, task) => sum + task.duration, 0);
    const focus = tasks.reduce((sum, task) => topTags.includes(task.tag) ? sum + task.duration : sum, 0);
    const percentage = total > 0 ? Math.round((focus / total) * 100) : 0;
    return { 
      totalDuration: total, 
      focusPercentage: percentage,
      totalHours: total / 60 // Convert minutes to hours
    };
  }, [tasks, topTags]);

  const getTotalTimeColor = (hours) => {
    if (hours < 6) return 'text-red-500';
    if (hours > 9) return 'text-red-500';
    return 'text-green-600';
  };

  const getFocusColor = (percentage) => {
    if (percentage >= 70) return 'bg-green-100 text-green-500';
    return 'bg-red-100 text-red-400';
  };

  // Sort tasks: incomplete first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // Calculate progress percentage
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(date, {
        title: newTaskTitle.trim(),
        tag: 'N/A',
        duration: 30,
        completed: false
      });
      setNewTaskTitle('');
    }
  };

  return (
    <div className="flex-shrink-0 w-64">
      <Droppable droppableId={date.toISOString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-4 rounded-lg ${
              snapshot.isDraggingOver
                ? 'bg-gray-100'
                : ''
            } flex flex-col transition-colors duration-200 h-auto`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className={`text-lg font-bold ${isToday ? 'text-gray-900' : 'text-gray-700'}`}>
                  {day}
                </h2>
                <p className="text-xs font-light text-gray-500">{formatDate(date)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium ${getTotalTimeColor(totalHours)}`}>
                {formatDuration(totalDuration)}
                {totalHours > 9 && <span className="font-bold ml-1">!</span>}
              </span>
              <span className={`text-xs font-medium p-1 rounded ${getFocusColor(focusPercentage)}`}>
                {focusPercentage}% Focus
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
              <div
                className="h-full bg-gray-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            <form onSubmit={handleAddTask} className="mb-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                className="w-full p-2 rounded text-gray-800 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
              />
            </form>

            <div>
              {sortedTasks.map((task, index) => (
                <Task
                  key={task.id}
                  task={task}
                  index={index}
                  onToggleComplete={() => onToggleComplete(task.id, date)}
                  onDelete={() => onDeleteTask(task.id, date)}
                  onEdit={() => onEditTask(task, date)}
                  topTags={topTags}
                  tags={tags}
                  onTagChange={(taskId, newTag) => onTagChange(taskId, newTag, date)}
                  onDurationChange={(taskId, newDuration) => onDurationChange(taskId, newDuration, date)}
                />
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DayColumn;