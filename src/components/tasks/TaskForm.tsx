import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle, Clock } from 'lucide-react';
import { Task, TaskPriority } from '../../types/task';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialTask?: Task;
  isEditing?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialTask,
  isEditing = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [label, setLabel] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      if (initialTask.dueDate) {
        const date = new Date(initialTask.dueDate);
        setDueDate(date.toISOString().split('T')[0]);
        setDueTime(date.toTimeString().slice(0, 5));
      }
      setPriority(initialTask.priority || 'medium');
      setLabels(initialTask.labels || []);
    }
  }, [initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    
    const combinedDueDate = dueDate && dueTime
      ? new Date(`${dueDate}T${dueTime}`).toISOString()
      : null;

    onSubmit({
      title,
      description,
      dueDate: combinedDueDate,
      priority,
      labels,
      completed: initialTask?.completed || false,
      googleCalendarEventId: initialTask?.googleCalendarEventId,
    });
  };

  const addLabel = () => {
    if (label.trim() && !labels.includes(label.trim())) {
      setLabels([...labels, label.trim()]);
      setLabel('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-auto shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? 'Edit Task' : 'New Task'}
        </h2>
        <button 
          onClick={onCancel} 
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError('');
          }}
          placeholder="Task title"
          fullWidth
          error={titleError}
          required
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about your task"
            className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full h-20 resize-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              Due Time
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-gray-500" />
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Tag className="h-4 w-4 mr-1 text-gray-500" />
            Labels
          </label>
          <div className="flex">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Add a label"
              className="px-3 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLabel();
                }
              }}
            />
            <button
              type="button"
              onClick={addLabel}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {labels.map((l, i) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {l}
                  <button
                    type="button"
                    onClick={() => removeLabel(l)}
                    className="ml-1 p-0.5 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button type="submit" fullWidth>
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;