import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import TaskDialog from './TaskDialog';
import DayColumn from './DayColumn';
import AITaskInput from './AITaskInput';
import SettingsMenu from './SettingsMenu';
import { Target, Clock } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ProductivityApp = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const storedTasks = localStorage.getItem('weeklyPlannerTasks');
      return storedTasks ? JSON.parse(storedTasks) : {};
    } catch (error) {
      console.error('Error parsing tasks from localStorage:', error);
      return {};
    }
  });

  const [tags, setTags] = useState(() => {
    try {
      const storedTags = localStorage.getItem('weeklyPlannerTags');
      return storedTags 
        ? JSON.parse(storedTags) 
        : ['Admin', 'Fundraising', 'Operations', 'Finance', 
           'Marketing', 'Sales', 'Development', 'HR', 'Customer Support'];
    } catch (error) {
      console.error('Error parsing tags from localStorage:', error);
      return ['Admin', 'Fundraising', 'Operations', 'Finance', 
              'Marketing', 'Sales', 'Development', 'HR', 'Customer Support'];
    }
  });

  const [numFocusAreas, setNumFocusAreas] = useState(() => {
    const stored = localStorage.getItem('weeklyPlannerNumFocusAreas');
    return stored ? parseInt(stored, 10) : 3;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isAIInputVisible, setIsAIInputVisible] = useState(false);
  
  const scrollContainerRef = useRef(null);

  const today = new Date();
  const weekDates = [...Array(7)].map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date;
  });

  const formatDateKey = useCallback((date) => date.toISOString().split('T')[0], []);

  const topTags = useMemo(() => tags.slice(0, numFocusAreas), [tags, numFocusAreas]);

  useEffect(() => {
    localStorage.setItem('weeklyPlannerTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('weeklyPlannerTags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey && event.key === 'k') {
        event.preventDefault();
        setIsAIInputVisible(true);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Escape') {
        setIsAIInputVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleNewTag = useCallback((newTag) => {
    setTags(prevTags => {
      if (!prevTags.includes(newTag)) {
        const updatedTags = [...prevTags, newTag];
        localStorage.setItem('weeklyPlannerTags', JSON.stringify(updatedTags));
        return updatedTags;
      }
      return prevTags;
    });
  }, []);

  const handleAddTask = useCallback((date, taskData) => {
    const newTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      tag: taskData.tag || '',
      duration: taskData.duration || 30,
      completed: false
    };

    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      updatedTasks[dateKey] = [...(updatedTasks[dateKey] || []), newTask];
      return updatedTasks;
    });
  }, []);

  const handleTaskSubmit = useCallback((taskData) => {
    const dateKey = formatDateKey(selectedDate);
    setTasks(prev => {
      const newTasks = { ...prev };
      if (editingTask) {
        newTasks[dateKey] = newTasks[dateKey].map(task =>
          task.id === editingTask.id ? { ...task, ...taskData } : task
        );
      } else {
        if (!newTasks[dateKey]) newTasks[dateKey] = [];
        newTasks[dateKey].push({ 
          id: Date.now(), 
          ...taskData,
          completed: false
        });
      }
      return newTasks;
    });

    if (taskData.tag && !tags.includes(taskData.tag)) {
      handleNewTag(taskData.tag);
    }

    setEditingTask(null);
    setIsDialogOpen(false);
  }, [selectedDate, editingTask, formatDateKey, tags, handleNewTag]);

  // eslint-disable-next-line no-unused-vars
  const getRelevantTasks = useCallback(() => {
    const today = new Date();
    const fiveDaysAgo = new Date(today.setDate(today.getDate() - 5));
    const fiveDaysFromNow = new Date(today.setDate(today.getDate() + 10));

    return Object.entries(tasks).reduce((relevantTasks, [dateKey, dateTasks]) => {
      const taskDate = new Date(dateKey);
      if (taskDate >= fiveDaysAgo && taskDate <= fiveDaysFromNow) {
        relevantTasks[dateKey] = dateTasks.map(task => ({
          id: task.id,
          title: task.title,
          duration: task.duration,
          tag: task.tag,
          completed: task.completed
        }));
      }
      return relevantTasks;
    }, {});
  }, [tasks]);

  const toggleTaskCompletion = useCallback((taskId, date) => {
    const dateKey = formatDateKey(date);
    setTasks(prev => {
      const newTasks = { ...prev };
      if (newTasks[dateKey]) {
        newTasks[dateKey] = newTasks[dateKey].map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
      }
      return newTasks;
    });
  }, [formatDateKey]);

  const deleteTask = useCallback((taskId, date) => {
    const dateKey = formatDateKey(date);
    setTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(task => task.id !== taskId)
    }));
  }, [formatDateKey]);

  const editTask = useCallback((task, date) => {
    setEditingTask(task);
    setSelectedDate(date);
    setIsDialogOpen(true);
  }, []);

  const rescheduleTask = useCallback((taskId, newDate) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      let movedTask;

      for (const dateKey in newTasks) {
        const taskIndex = newTasks[dateKey].findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          [movedTask] = newTasks[dateKey].splice(taskIndex, 1);
          break;
        }
      }

      if (movedTask) {
        const newDateKey = formatDateKey(newDate);
        if (!newTasks[newDateKey]) {
          newTasks[newDateKey] = [];
        }
        newTasks[newDateKey].push(movedTask);
      }

      return newTasks;
    });
  }, [formatDateKey]);

  const modifyTask = useCallback((taskId, modifications) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      for (const dateKey in newTasks) {
        const taskIndex = newTasks[dateKey].findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          newTasks[dateKey][taskIndex] = {
            ...newTasks[dateKey][taskIndex],
            ...modifications
          };
          break;
        }
      }
      return newTasks;
    });
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleAITaskCreation = useCallback((taskData) => {
    const dateKey = formatDateKey(taskData.date);
    setTasks(prev => ({
      ...prev,
      [dateKey]: [
        ...(prev[dateKey] || []),
        {
          id: Date.now(),
          title: taskData.title,
          duration: taskData.duration,
          tag: taskData.tag,
          completed: false
        }
      ]
    }));
  }, [formatDateKey]);

  const handleAITaskCompletion = useCallback((taskIds) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      taskIds.forEach(taskId => {
        for (const dateKey in newTasks) {
          const taskIndex = newTasks[dateKey].findIndex(task => task.id.toString() === taskId.toString());
          if (taskIndex !== -1) {
            newTasks[dateKey][taskIndex] = {
              ...newTasks[dateKey][taskIndex],
              completed: true
            };
            break;
          }
        }
      });
      return newTasks;
    });
  }, []);

  const handleAITaskUncompletion = useCallback((taskIds) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      taskIds.forEach(taskId => {
        for (const dateKey in newTasks) {
          const taskIndex = newTasks[dateKey].findIndex(task => task.id.toString() === taskId.toString());
          if (taskIndex !== -1) {
            newTasks[dateKey][taskIndex] = {
              ...newTasks[dateKey][taskIndex],
              completed: false
            };
            break;
          }
        }
      });
      return newTasks;
    });
  }, []);

  const onDragEnd = useCallback((result) => {
    const { source, destination } = result;

    if (!destination) return;

    setTasks(prev => {
      const newTasks = { ...prev };
      const sourceDate = new Date(source.droppableId);
      const destDate = new Date(destination.droppableId);
      const sourceDateKey = formatDateKey(sourceDate);
      const destDateKey = formatDateKey(destDate);

      if (!newTasks[sourceDateKey]) newTasks[sourceDateKey] = [];
      if (!newTasks[destDateKey]) newTasks[destDateKey] = [];

      const [reorderedItem] = newTasks[sourceDateKey].splice(source.index, 1);
      newTasks[destDateKey].splice(destination.index, 0, reorderedItem);

      return newTasks;
    });
  }, [formatDateKey]);

  const handleTagsChange = useCallback((newTags) => {
    setTags(newTags);
  }, []);

  const handleNumFocusAreasChange = useCallback((newNum) => {
    setNumFocusAreas(newNum);
    localStorage.setItem('weeklyPlannerNumFocusAreas', newNum.toString());
  }, []);

  const { keyTaskTime, totalTime, filledTime } = useMemo(() => {
    let keyTask = 0;
    let total = 0;
    let filled = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(now.getDate() + 5); // 5 days from now, including today

    Object.entries(tasks).forEach(([dateString, dayTasks]) => {
      const taskDate = new Date(dateString);
      if (taskDate >= now && taskDate < fiveDaysFromNow && taskDate.getDay() !== 0 && taskDate.getDay() !== 6) {
        dayTasks.forEach(task => {
          total += task.duration;
          filled += task.duration;
          if (topTags.includes(task.tag)) {
            keyTask += task.duration;
          }
        });
      }
    });

    return { keyTaskTime: keyTask, totalTime: total, filledTime: filled };
  }, [tasks, topTags]);

  const formatTime = (minutes) => {
    return `${(minutes / 60).toFixed(1)}h`;
  };

  const getBackgroundColor = (percentage) => {
    return percentage >= 70 ? 'bg-green-100' : 'bg-red-100';
  };

  const getTextColor = (percentage) => {
    return percentage >= 70 ? 'text-green-700' : 'text-red-700';
  };

  const keyTaskPercentage = Math.round((keyTaskTime / totalTime) * 100) || 0;
  const filledPercentage = Math.round((filledTime / (40 * 60)) * 100) || 0;

  const handleTagChange = (taskId, newTag, date) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      const dateKey = formatDateKey(date);
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey] = updatedTasks[dateKey].map(task => 
          task.id === taskId ? { ...task, tag: newTag } : task
        );
      }
      return updatedTasks;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <SettingsMenu 
        onTagsChange={handleTagsChange} 
        initialTags={tags}
        numFocusAreas={numFocusAreas}
        onNumFocusAreasChange={handleNumFocusAreasChange}
      />
      <div className="flex-1 overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
            Focus on what matters
          </h1>
          <div className="flex space-x-4 mb-6">
            <div className={`flex items-center p-2 rounded-lg ${getBackgroundColor(keyTaskPercentage)}`}>
              <Target className={`mr-2 ${getTextColor(keyTaskPercentage)}`} size={18} />
              <span className={`font-semibold ${getTextColor(keyTaskPercentage)}`}>
                {formatTime(keyTaskTime)} / {formatTime(totalTime)} ({keyTaskPercentage}%)
              </span>
            </div>
            <div className={`flex items-center p-2 rounded-lg ${getBackgroundColor(filledPercentage)}`}>
              <Clock className={`mr-2 ${getTextColor(filledPercentage)}`} size={18} />
              <span className={`font-semibold ${getTextColor(filledPercentage)}`}>
                {formatTime(filledTime)} / 40h ({filledPercentage}%)
              </span>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="overflow-x-auto" ref={scrollContainerRef}>
              <div className="flex pb-4 space-x-4" style={{ width: 'calc(100vw - 16rem)' }}>
                {weekDates.map((date, index) => (
                  <DayColumn
                    key={formatDateKey(date)}
                    day={DAYS[date.getDay()]}
                    date={date}
                    isToday={index === 0}
                    tasks={tasks[formatDateKey(date)] || []}
                    onAddTask={handleAddTask}
                    onToggleComplete={toggleTaskCompletion}
                    onDeleteTask={deleteTask}
                    onEditTask={editTask}
                    topTags={topTags}
                    tags={tags}
                    onTagChange={handleTagChange}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>
          <TaskDialog
            isOpen={isDialogOpen}
            onClose={() => {
              setIsDialogOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleTaskSubmit}
            initialTask={editingTask}
            tags={tags}
            onNewTag={handleNewTag}
          />
          <AITaskInput
            onTaskCreation={handleAddTask}
            onTaskCompletion={handleAITaskCompletion}
            onTaskUncompletion={handleAITaskUncompletion}
            onTaskReschedule={rescheduleTask}
            onTaskModification={modifyTask}
            isVisible={isAIInputVisible}
            onClose={() => setIsAIInputVisible(false)}
            relevantTasks={Object.values(tasks).flat()}
            currentDate={new Date().toISOString().split('T')[0]}
            tags={tags}
            onNewTag={handleNewTag}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductivityApp;