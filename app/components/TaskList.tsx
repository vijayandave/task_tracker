"use client";

import { useEffect, useState } from "react";
import { useTask, Task } from "@/app/context/TaskContext";
import TaskCard from "./TaskCard";

interface TaskListProps {
  filter?: "all" | "active" | "completed";
  tag?: string;
}

export default function TaskList({ filter = "all", tag }: TaskListProps) {
  const { tasks, isLoading, fetchTasks } = useTask();
  const [sortBy, setSortBy] = useState<"dueDate" | "created">("dueDate");

  useEffect(() => {
    const filters: any = {};
    if (filter === "active") filters.completed = false;
    if (filter === "completed") filters.completed = true;
    if (tag) filters.tag = tag;

    fetchTasks(filters);
  }, [filter, tag, fetchTasks]);

  let filteredTasks = tasks;

  if (filter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (filter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (tag) {
    filteredTasks = filteredTasks.filter((t) => t.tags?.includes(tag.toLowerCase()));
  }

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          {filter === "active" && "Active Tasks"}
          {filter === "completed" && "Completed Tasks"}
          {filter === "all" && "All Tasks"}
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-sm px-3 py-1 border border-gray-300 rounded-lg text-gray-800"
        >
          <option value="dueDate">Due Date</option>
          <option value="created">Date Created</option>
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-8 text-gray-500">Loading tasks...</div>
      )}

      {!isLoading && sortedTasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {filter === "active" && "No active tasks. Great job!"}
          {filter === "completed" && "No completed tasks yet."}
          {filter === "all" && "No tasks yet. Create one to get started."}
        </div>
      )}

      <div className="space-y-2">
        {sortedTasks.map((task) => (
          <div key={task.id} className="animate-slide-up">
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );
}
