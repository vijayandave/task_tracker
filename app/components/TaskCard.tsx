"use client";

import { useState } from "react";
import { Task } from "@/app/context/TaskContext";
import { useTask } from "@/app/context/TaskContext";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { updateTask, deleteTask, toggleTask } = useTask();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
    } catch (error) {
      alert("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    if (!task.completed) {
      setIsCompleting(true);
    }
    try {
      await toggleTask(task.id);
    } catch (error) {
      alert("Failed to toggle task");
      setIsCompleting(false);
    }
  };

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  const getTagColor = (tag: string) => {
    const normalizedTag = tag.toLowerCase();
    if (normalizedTag === "low") return "bg-blue-100 text-blue-800";
    if (normalizedTag === "medium") return "bg-yellow-100 text-yellow-800";
    if (normalizedTag === "high") return "bg-red-100 text-red-800";
    return "bg-purple-100 text-purple-800";
  };

  // Sort tags: priority tags first (low, medium, high), then others
  const sortedTags = (task.tags && Array.isArray(task.tags) && task.tags.length > 0)
    ? [...task.tags].sort((a, b) => {
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        const aPriority = priorityOrder[a.toLowerCase() as keyof typeof priorityOrder];
        const bPriority = priorityOrder[b.toLowerCase() as keyof typeof priorityOrder];
        
        // If both are priority tags, sort by priority order
        if (aPriority !== undefined && bPriority !== undefined) {
          return aPriority - bPriority;
        }
        // Priority tags come first
        if (aPriority !== undefined) return -1;
        if (bPriority !== undefined) return 1;
        // Otherwise alphabetical
        return a.localeCompare(b);
      })
    : [];

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition ${
        task.completed ? "opacity-60" : ""
      } ${isCompleting ? "animate-task-complete" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          className="mt-1 w-5 h-5 cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium text-gray-900 ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {dueDate && (
              <span
                className={`text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded`}
              >
                {dueDate}
              </span>
            )}
            {sortedTags.length > 0 && (
              <>
                {sortedTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </>
            )}
            {isOverdue && (
              <span className="text-xs font-medium bg-red-200 text-red-900 px-2 py-1 rounded uppercase">
                Overdue
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
        >
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
