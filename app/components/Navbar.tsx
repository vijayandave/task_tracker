"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">TaskTracker</span>
            </Link>

            {user && (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/calendar"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  Calendar
                </Link>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
