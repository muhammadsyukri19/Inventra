'use client';

import { useEffect, useMemo, useState } from 'react';

export type WarehouseTask = {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'inventra-warehouse-tasks';

const loadTasks = (): WarehouseTask[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WarehouseTask[];
  } catch {
    return [];
  }
};

const persistTasks = (tasks: WarehouseTask[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const generateId = () => {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function useTaskList() {
  const [tasks, setTasks] = useState<WarehouseTask[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    persistTasks(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed);
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const addTask = (payload: { title: string; description: string; dueDate?: string }) => {
    const trimmedTitle = payload.title.trim();
    if (!trimmedTitle) return;

    const newTask: WarehouseTask = {
      id: generateId(),
      title: trimmedTitle,
      description: payload.description.trim(),
      dueDate: payload.dueDate?.trim() || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((current) => [newTask, ...current]);
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.completed));
  };

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    deleteTask,
    clearCompleted,
  };
}
