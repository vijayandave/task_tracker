"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { useTask } from "@/app/context/TaskContext";
import { Task } from "@/app/context/TaskContext";

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const { tasks, fetchTasks, toggleTask } = useTask();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchTasks();
    }
  }, [user, isLoading, router, fetchTasks]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= monthDays; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getFullYear() === date.getFullYear() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getDate() === date.getDate()
      );
    });
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isLoading2 = isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading2 && (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}

        {!isLoading2 && user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{monthName}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                        )
                      }
                      className="px-3 py-1 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded font-medium text-sm"
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                        )
                      }
                      className="px-3 py-1 text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-600 text-sm py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    const dayTasks = date ? getTasksForDate(date) : [];
                    const isSelected =
                      selectedDate &&
                      date &&
                      selectedDate.toDateString() === date.toDateString();
                    const isToday =
                      date && date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        className={`min-h-24 p-2 rounded border cursor-pointer transition ${
                          !date
                            ? "bg-gray-50 border-transparent"
                            : isSelected
                              ? "bg-blue-100 border-blue-400"
                              : isToday
                                ? "bg-green-50 border-green-300"
                                : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {date && (
                          <>
                            <div className={`font-semibold text-sm mb-1 ${
                              isToday ? "text-green-700" : "text-gray-700"
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayTasks.slice(0, 2).map((task) => (
                                <div
                                  key={task.id}
                                  className={`text-xs p-1 rounded truncate ${
                                    task.completed
                                      ? "bg-gray-200 text-gray-600"
                                      : task.priority === "HIGH"
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === "MEDIUM"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-gray-500 px-1">
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected date details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {selectedDate ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>

                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).length === 0 ? (
                        <p className="text-gray-500 text-sm">No tasks for this date.</p>
                      ) : (
                        getTasksForDate(selectedDate).map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded border ${
                              task.completed
                                ? "bg-gray-50 border-gray-200"
                                : "bg-blue-50 border-blue-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="mt-1 w-4 h-4"
                              />
                              <div className="flex-1">
                                <p
                                  className={`font-medium text-sm ${
                                    task.completed
                                      ? "line-through text-gray-500"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {task.description}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                      task.priority === "HIGH"
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === "MEDIUM"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Select a date to see tasks.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
