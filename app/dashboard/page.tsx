"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import TaskForm from "@/app/components/TaskForm";
import TaskList from "@/app/components/TaskList";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side - Task form */}
          <div className="lg:col-span-1">
            <TaskForm />
          </div>

          {/* Right side - Task list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
                <button
                  onClick={() => setFilter("active")}
                  className={`px-4 py-2 font-medium rounded-lg transition ${
                    filter === "active"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={`px-4 py-2 font-medium rounded-lg transition ${
                    filter === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2 font-medium rounded-lg transition ${
                    filter === "all"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All
                </button>
              </div>

              <TaskList filter={filter} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
