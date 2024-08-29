import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import DayColumn from './DayColumn';
import AITaskInput from './AITaskInput';
import SettingsMenu from './SettingsMenu';
import Block from './Block';
import { Target, Clock, CalendarDays } from 'lucide-react';
import { animated, useSpring } from 'react-spring';

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

  const [isAIInputVisible, setIsAIInputVisible] = useState(false);
  
  const scrollContainerRef = useRef(null);

  const [weekDates, setWeekDates] = useState(() => {
    const today = new Date();
    return [...Array(14)].map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 7 + index);
      return date;
    });
  });

  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

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

  const handleEditTask = (taskId, updates, date) => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const formattedDate = formatDateKey(new Date(date));
      if (!newTasks[formattedDate]) {
        console.error(`No tasks found for date: ${formattedDate}`);
        return prevTasks; // Return the previous state unchanged
      }
      const taskIndex = newTasks[formattedDate].findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        newTasks[formattedDate][taskIndex] = { ...newTasks[formattedDate][taskIndex], ...updates };
      } else {
        console.error(`Task with id ${taskId} not found for date ${formattedDate}`);
      }
      return newTasks;
    });
  };

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
    return percentage >= 70 ? 'text-green-500' : 'text-red-500';
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

  const handleDurationChange = useCallback((taskId, newDuration, date) => {
    setTasks(prevTasks => {
      const updatedTasks = { ...prevTasks };
      const dateKey = formatDateKey(date);
      if (updatedTasks[dateKey]) {
        updatedTasks[dateKey] = updatedTasks[dateKey].map(task => 
          task.id === taskId ? { ...task, duration: newDuration } : task
        );
      }
      return updatedTasks;
    });
  }, [formatDateKey]);

  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      const today = new Date();
      const todayIndex = weekDates.findIndex(date => 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
      
      if (todayIndex !== -1) {
        const dayWidth = scrollContainerRef.current.scrollWidth / weekDates.length;
        const scrollPosition = dayWidth * todayIndex;
        scrollContainerRef.current.scrollLeft = scrollPosition;
      } else {
        // If today is not in the current range, reset the weekDates
        const newWeekDates = [...Array(14)].map((_, index) => {
          const date = new Date(today);
          date.setDate(today.getDate() - 7 + index);
          return date;
        });
        setWeekDates(newWeekDates);
        // Scroll after the state has been updated
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const dayWidth = scrollContainerRef.current.scrollWidth / 14;
            const scrollPosition = dayWidth * 7; // 7 days before today
            scrollContainerRef.current.scrollLeft = scrollPosition;
          }
        }, 0);
      }
    }
  }, [weekDates]);

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      if (scrollLeft === 0 && !isLoadingPrev) {
        setIsLoadingPrev(true);
        const newWeek = [...Array(7)].map((_, index) => {
          const date = new Date(weekDates[0]);
          date.setDate(date.getDate() - 7 + index);
          return date;
        });
        setWeekDates(prev => [...newWeek, ...prev]);
        setTimeout(() => setIsLoadingPrev(false), 500);
      }

      if (scrollLeft + clientWidth >= scrollWidth - 10 && !isLoadingNext) {
        setIsLoadingNext(true);
        const newWeek = [...Array(7)].map((_, index) => {
          const date = new Date(weekDates[weekDates.length - 1]);
          date.setDate(date.getDate() + 1 + index);
          return date;
        });
        setWeekDates(prev => [...prev, ...newWeek]);
        setTimeout(() => setIsLoadingNext(false), 500);
      }
    }
  }, [weekDates, isLoadingPrev, isLoadingNext]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const fadeInProps = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 300 },
  });

  useEffect(() => {
    scrollToToday();
  }, [scrollToToday]);

  return (
    <div className="flex h-screen bg-white text-gray-800">
      <SettingsMenu 
        onTagsChange={handleTagsChange} 
        initialTags={tags}
        numFocusAreas={numFocusAreas}
        onNumFocusAreasChange={handleNumFocusAreasChange}
      />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-8">
          <div className="flex space-x-4 mb-6 items-center">
            <button
              onClick={scrollToToday}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <CalendarDays className="mr-2" size={18} />
              Today
            </button>
            <div className="text-sm font-medium text-gray-500">
              {formatDateKey(new Date())}
            </div>
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
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 overflow-x-auto" ref={scrollContainerRef}>
            <div className="h-full">
              <div className="flex pb-4 space-x-4 h-full" style={{ width: `calc(${weekDates.length / 7 * 100}vw - 32rem)` }}>
                {weekDates.map((date, index) => (
                  <animated.div key={formatDateKey(date)} style={index < 7 || index >= weekDates.length - 7 ? fadeInProps : {}} className="h-full">
                    <DayColumn
                      day={DAYS[date.getDay()]}
                      date={date}
                      isToday={formatDateKey(date) === formatDateKey(new Date())}
                      tasks={tasks[formatDateKey(date)] || []}
                      onAddTask={handleAddTask}
                      onToggleComplete={toggleTaskCompletion}
                      onDeleteTask={deleteTask}
                      onEditTask={handleEditTask}
                      topTags={topTags}
                      tags={tags}
                      onTagChange={handleTagChange}
                      onDurationChange={handleDurationChange}
                    />
                  </animated.div>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>
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
      <Block />
    </div>
  );
};

export default ProductivityApp;