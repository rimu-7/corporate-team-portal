"use client";

import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Role } from "@/app/types";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <nav className="p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          CorpPortal
        </Link>
        
        <div className="flex gap-4 items-center">
          {!user ? (
            <>
              <Link href="/login" className="hover:text-blue-400">Login</Link>
              <Link href="/register" className="hover:text-blue-400">Register</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="hover:text-blue-400">Dashboard</Link>
              
              {user.role === Role.MANAGER && (
                <Link href="/manager" className="hover:text-blue-400">Manager Panel</Link>
              )}
              
              {user.role === Role.ADMIN && (
                 <Link href="/admin" className="hover:text-blue-400">Admin Panel</Link>
              )}

              <div className="flex items-center gap-4 ml-6 border-l pl-6 border-slate-700">
                <div className="text-sm text-right">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}