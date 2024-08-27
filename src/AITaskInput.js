import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const AITaskInput = ({ onTaskCreation, onTaskCompletion, onTaskUncompletion, onTaskReschedule, onTaskModification, isVisible, onClose, relevantTasks, currentDate, tags, onNewTag }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const parseAIResponse = (response) => {
    const tasks = [];
    const lines = response.split('\n');
    let currentTask = null;

    for (const line of lines) {
      if (line.startsWith('Task:')) {
        if (currentTask) tasks.push(currentTask);
        currentTask = { title: line.substring(6).trim(), tag: '', duration: 30, date: null };
      } else if (line.startsWith('Tag:') && currentTask) {
        currentTask.tag = line.substring(4).trim();
      } else if (line.startsWith('Duration:') && currentTask) {
        const duration = parseInt(line.substring(9).trim());
        currentTask.duration = isNaN(duration) ? 30 : duration;
      } else if (line.startsWith('Date:') && currentTask) {
        currentTask.date = line.substring(5).trim();
      }
    }

    if (currentTask) tasks.push(currentTask);
    return tasks;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    setLoading(true);
    setError(null);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant that creates tasks based on user input. For each task, provide a Task:, a Tag:, a Duration: (in minutes), and a Date: (in YYYY-MM-DD format) on separate lines. Use tags from the provided list or suggest new ones if necessary." },
          { role: "user", content: `Create tasks based on this input: "${input}". Current tags: ${tags.join(', ')}. Current date: ${currentDate}. Relevant tasks: ${JSON.stringify(relevantTasks)}` }
        ],
      });

      const aiResponse = completion.choices[0].message.content;
      const tasks = parseAIResponse(aiResponse);

      tasks.forEach(task => {
        if (task.tag && !tags.includes(task.tag)) {
          onNewTag(task.tag);
        }
        onTaskCreation(task.date || currentDate, task);
      });

      setInput('');
    } catch (err) {
      setError('An error occurred while processing your request.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-white rounded-t-lg shadow-lg p-4 mx-auto max-w-3xl">
        <div className="flex items-center w-full">
          <Bot className="text-gray-700 mr-4 hidden sm:block flex-shrink-0" size={24} />
          <form onSubmit={handleSubmit} className="flex-grow flex items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? "Processing..." : "Add, modify, or reschedule tasks with AI"}
              className="w-full py-2 px-3 rounded-lg focus:outline-none text-gray-700 placeholder-gray-400 bg-transparent focus:bg-white focus:ring-1 focus:ring-gray-200 text-sm"
              disabled={loading}
              style={{ minHeight: '40px', lineHeight: '24px' }}
            />
            <button
              type="button"
              onClick={onClose}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Close
            </button>
          </form>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default AITaskInput;