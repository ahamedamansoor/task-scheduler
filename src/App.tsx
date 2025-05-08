import React, { useState } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import Header from './components/layout/Header';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import { Task } from './types/task';

const TaskApp: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTaskContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddTask = () => {
    setTaskToEdit(undefined);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }
    setIsFormOpen(false);
    setTaskToEdit(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setTaskToEdit(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddTask={handleAddTask} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="mt-8">
          {isFormOpen ? (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
              <TaskForm
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialTask={taskToEdit}
                isEditing={!!taskToEdit}
              />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onComplete={toggleComplete}
              onDelete={deleteTask}
              onEdit={handleEditTask}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <TaskProvider>
      <TaskApp />
    </TaskProvider>
  );
}

export default App;