import React, { useState, useMemo } from 'react';
import { Task } from '../../types/task';
import TaskItem from './TaskItem';
import { CheckSquare, Filter, Clock, List } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  searchQuery: string;
}

type FilterType = 'all' | 'active' | 'completed';
type SortType = 'newest' | 'oldest' | 'dueDate' | 'priority';

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onComplete,
  onDelete,
  onEdit,
  searchQuery,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('newest');
  
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        task => 
          task.title.toLowerCase().includes(query) || 
          task.description.toLowerCase().includes(query) ||
          task.labels.some(label => label.toLowerCase().includes(query))
      );
    }
    
    // Apply filter
    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    }
    
    // Apply sort
    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority': {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        default:
          return 0;
      }
    });
    
    return result;
  }, [tasks, filter, sort, searchQuery]);
  
  const getCompletionStats = () => {
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };
  
  const stats = getCompletionStats();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <List className="h-5 w-5 mr-2 text-blue-600" />
            Tasks
          </h2>
          <div className="hidden md:flex items-center bg-blue-50 px-3 py-1 rounded-full">
            <CheckSquare className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-sm">
              {stats.completed}/{stats.total} ({stats.percentage}%)
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="text-sm border rounded px-2 py-1 bg-white flex items-center"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <Filter className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">
            {searchQuery 
              ? 'No tasks match your search' 
              : filter === 'completed' 
                ? 'No completed tasks yet' 
                : filter === 'active' 
                  ? 'No active tasks - time to add some!' 
                  : 'No tasks - add your first one!'}
          </p>
        </div>
      ) : (
        <div>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;