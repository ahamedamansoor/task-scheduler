import React, { useState } from 'react';
import { Check, Trash, Edit, Clock, Tag, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { Task, TaskPriority } from '../../types/task';
import Button from '../ui/Button';
import { useTaskContext } from '../../context/TaskContext';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const { syncWithGoogleCalendar } = useTaskContext();
  
  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800'
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && !task.completed;
  };

  const handleGoogleCalendarSync = async () => {
    await syncWithGoogleCalendar(task.id);
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 mb-3 ${
        task.completed ? 'border-green-200 bg-green-50' : isOverdue() ? 'border-red-200' : 'border-gray-200 hover:border-blue-200'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <button
            onClick={() => onComplete(task.id)}
            className={`flex-shrink-0 h-6 w-6 rounded-full border flex items-center justify-center mr-3 mt-0.5 transition-colors ${
              task.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            {task.completed && <Check className="h-4 w-4" />}
          </button>
          
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <h3 
                className={`text-base font-medium ${
                  task.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {task.title}
              </h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 p-1 rounded-full hover:bg-gray-100"
              >
                {expanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            
            <div className="flex flex-wrap items-center mt-2 gap-2">
              {task.priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              )}
              
              {task.dueDate && (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center ${
                  isOverdue() ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              
              {task.labels && task.labels.length > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {task.labels.length > 1 ? `${task.labels.length} labels` : task.labels[0]}
                </span>
              )}

              {task.googleCalendarEventId && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Synced
                </span>
              )}
            </div>
            
            {expanded && (
              <div className="mt-3 space-y-3">
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((label, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="pt-2 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  {task.dueDate && !task.googleCalendarEventId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGoogleCalendarSync}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Add to Calendar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;