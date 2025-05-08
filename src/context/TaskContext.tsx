import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Task, TaskContextType, GoogleCalendarEvent } from '../types/task';
import { addHours } from 'date-fns';

type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; task: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'SYNC_CALENDAR'; payload: { id: string; eventId: string } };

const generateId = () => Math.random().toString(36).substring(2, 9);

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const reducer = (state: Task[], action: TaskAction): Task[] => {
  switch (action.type) {
    case 'ADD_TASK':
      return [
        ...state,
        {
          ...action.payload,
          id: generateId(),
          createdAt: new Date().toISOString(),
        },
      ];
    case 'UPDATE_TASK':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.task }
          : task
      );
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload);
    case 'TOGGLE_COMPLETE':
      return state.map((task) =>
        task.id === action.payload
          ? { ...task, completed: !task.completed }
          : task
      );
    case 'SYNC_CALENDAR':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, googleCalendarEventId: action.payload.eventId }
          : task
      );
    default:
      return state;
  }
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

const STORAGE_KEY = 'taskmanager-tasks';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, dispatch] = useReducer(reducer, [], () => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    return storedTasks ? JSON.parse(storedTasks) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, task } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleComplete = (id: string) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  };

  const syncWithGoogleCalendar = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.dueDate) return;

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: async (response) => {
          if (response.access_token) {
            const event: GoogleCalendarEvent = {
              summary: task.title,
              description: task.description,
              start: {
                dateTime: task.dueDate,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              end: {
                dateTime: addHours(new Date(task.dueDate), 1).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
            };

            const response = await fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events',
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${response.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
              }
            );

            const data = await response.json();
            dispatch({ type: 'SYNC_CALENDAR', payload: { id: taskId, eventId: data.id } });
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, updateTask, deleteTask, toggleComplete, syncWithGoogleCalendar }}
    >
      {children}
    </TaskContext.Provider>
  );
};