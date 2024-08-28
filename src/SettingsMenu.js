import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Target, Trash2, Plus, DollarSign, Bird, Landmark, Clipboard, Plug, FileCode, PiggyBank, Users, PhoneCall, Book } from 'lucide-react';

const SettingsMenu = ({ onTagsChange, initialTags, numFocusAreas, onNumFocusAreasChange }) => {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState('');
  const [editingTagIndex, setEditingTagIndex] = useState(null);
  const [editingTagValue, setEditingTagValue] = useState('');
  const [editingObjectiveTag, setEditingObjectiveTag] = useState(null);
  const [editingObjectiveValue, setEditingObjectiveValue] = useState('');
  const [objectives, setObjectives] = useState(() => {
    try {
      const storedObjectives = localStorage.getItem('weeklyPlannerObjectives');
      return storedObjectives ? JSON.parse(storedObjectives) : {};
    } catch (error) {
      console.error('Error parsing objectives from localStorage:', error);
      return {};
    }
  });

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(tags);
    }
  }, [tags, onTagsChange]);

  useEffect(() => {
    localStorage.setItem('weeklyPlannerObjectives', JSON.stringify(objectives));
  }, [objectives]);

  const handleAddTag = useCallback(() => {
    if (newTag && !tags.includes(newTag)) {
      setTags(prevTags => [...prevTags, newTag]);
      setNewTag('');
    }
  }, [newTag, tags]);

  const handleTagChange = useCallback((index, value) => {
    setTags(prevTags => {
      const updatedTags = [...prevTags];
      if (value === '') {
        updatedTags.splice(index, 1);
        setObjectives(prevObjectives => {
          const updatedObjectives = { ...prevObjectives };
          delete updatedObjectives[prevTags[index]];
          return updatedObjectives;
        });
      } else {
        if (objectives[prevTags[index]]) {
          setObjectives(prevObjectives => {
            const updatedObjectives = { ...prevObjectives };
            updatedObjectives[value] = updatedObjectives[prevTags[index]];
            delete updatedObjectives[prevTags[index]];
            return updatedObjectives;
          });
        }
        updatedTags[index] = value;
      }
      return updatedTags;
    });
    setEditingTagIndex(null);
    setEditingTagValue('');
  }, [objectives]);

  const onDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (draggableId === 'focusDivider') {
      const newNumFocusAreas = destination.index;
      onNumFocusAreasChange(newNumFocusAreas);
    } else {
      setTags(prevTags => {
        const newTags = Array.from(prevTags);
        const [reorderedItem] = newTags.splice(source.index, 1);
        newTags.splice(destination.index, 0, reorderedItem);
        return newTags;
      });
    }
  }, [onNumFocusAreasChange]);

  const handleObjectiveChange = useCallback((tag, objective) => {
    setObjectives(prevObjectives => ({ ...prevObjectives, [tag]: objective }));
  }, []);

  const finishEditingObjective = useCallback(() => {
    if (editingObjectiveTag) {
      handleObjectiveChange(editingObjectiveTag, editingObjectiveValue);
      setEditingObjectiveTag(null);
      setEditingObjectiveValue('');
    }
  }, [editingObjectiveTag, editingObjectiveValue, handleObjectiveChange]);

  const getTagStyle = (index) => {
    if (index < numFocusAreas) return 'font-medium';
    return 'font-normal';
  };

  const getTagIcon = (tag) => {
    const lowercaseTag = tag.toLowerCase();
    if (lowercaseTag.includes('sales')) return <DollarSign size={12} />;
    if (lowercaseTag.includes('marketing')) return <Bird size={12} />;
    if (lowercaseTag.includes('fundraising')) return <Landmark size={12} />;
    if (lowercaseTag.includes('admin')) return <Clipboard size={12} />;
    if (lowercaseTag.includes('operations')) return <Plug size={12} />;
    if (lowercaseTag.includes('development')) return <FileCode size={12} />;
    if (lowercaseTag.includes('finance')) return <PiggyBank size={12} />;
    if (lowercaseTag.includes('hr') || lowercaseTag.includes('human resources')) return <Users size={12} />;
    if (lowercaseTag.includes('customer support') || lowercaseTag.includes('customer service')) return <PhoneCall size={12} />;
    return <Book size={12} />; // Default icon
  };

  const renderTag = (tag, index) => (
    <Draggable key={tag} draggableId={tag} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 group ${getTagStyle(index)}`}
        >
          <div className="flex items-center">
            <span className="mr-2 text-gray-400">{getTagIcon(tag)}</span>
            <input
              type="text"
              value={editingTagIndex === index ? editingTagValue : tag}
              onChange={(e) => {
                if (editingTagIndex === index) {
                  setEditingTagValue(e.target.value);
                }
              }}
              onBlur={() => {
                handleTagChange(index, editingTagValue || tag);
              }}
              onFocus={() => {
                setEditingTagIndex(index);
                setEditingTagValue(tag);
              }}
              className="bg-transparent border-none focus:outline-none w-full text-sm"
            />
            <button
              onClick={() => {
                setEditingObjectiveTag(tag);
                setEditingObjectiveValue(objectives[tag] || '');
              }}
              className="ml-2 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <Target size={14} />
            </button>
            <button
              onClick={() => handleTagChange(index, '')}
              className="ml-2 text-gray-500 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {editingObjectiveTag === tag ? (
            <textarea
              value={editingObjectiveValue}
              onChange={(e) => setEditingObjectiveValue(e.target.value)}
              onBlur={finishEditingObjective}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  finishEditingObjective();
                }
              }}
              className="mt-1 w-3/4 text-xs p-1 rounded focus:outline-none focus:ring-1 focus:ring-gray-600 ml-6 resize-none overflow-hidden"
              placeholder="Enter objective"
              autoFocus
              rows={1}
              style={{ minHeight: '1.5em', height: 'auto' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          ) : objectives[tag] ? (
            <p
              className="mt-1 w-3/4 text-xs text-gray-500 cursor-text ml-6 whitespace-pre-wrap break-words"
              onClick={() => {
                setEditingObjectiveTag(tag);
                setEditingObjectiveValue(objectives[tag] || '');
              }}
            >
              {objectives[tag]}
            </p>
          ) : null}
        </li>
      )}
    </Draggable>
  );

  return (
    <div className="h-full bg-[#F9F9F9] text-[#6B6B83] border-r border-gray-300 w-64 overflow-y-auto">
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-[10px] mb-4 tracking-wider font-normal text-gray-500 uppercase">PRIORITIES</h3>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tags" type="TAG">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="text-sm">
                  {tags.map((tag, index) => (
                    <React.Fragment key={tag}>
                      {renderTag(tag, index)}
                      {index === numFocusAreas - 1 && (
                        <Draggable draggableId="focusDivider" index={numFocusAreas}>
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="my-4 border-t border-gray-300 pt-4 cursor-move -mx-4"
                            >
                            </li>
                          )}
                        </Draggable>
                      )}
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          
          <div className="flex items-center mt-2">
            <Plus size={14} className="text-gray-400 mr-3" />
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
              placeholder="Add new focus"
              className="bg-transparent text-[#6B6B83] w-full text-xs focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;