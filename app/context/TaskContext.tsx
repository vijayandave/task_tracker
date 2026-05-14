"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  recurring: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  recurrenceEndDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (filters?: { completed?: boolean; tag?: string }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async (filters?: { completed?: boolean; tag?: string }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.completed !== undefined) {
        params.append("completed", String(filters.completed));
      }
      if (filters?.tag) {
        params.append("tag", filters.tag);
      }

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        console.error("Failed to fetch tasks:", response.status);
        return;
      }
      const data = await response.json().catch(() => ({ tasks: [] }));
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = async (data: Partial<Task>): Promise<Task> => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to create task" }));
      throw new Error(error.error || "Failed to create task");
    }

    const task = await response.json();
    setTasks([...tasks, task]);
    return task;
  };

  const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to update task" }));
      throw new Error(error.error || "Failed to update task");
    }

    const updatedTask = await response.json();
    setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to delete task" }));
      throw new Error(error.error || "Failed to delete task");
    }

    setTasks(tasks.filter((t) => t.id !== id));
  };

  const toggleTask = async (id: string) => {
    const response = await fetch(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to toggle task" }));
      throw new Error(error.error || "Failed to toggle task");
    }

    const updatedTask = await response.json();
    setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
  };

  return (
    <TaskContext.Provider value={{ tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, toggleTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within TaskProvider");
  }
  return context;
}
