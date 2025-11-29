"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Role, User } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [resolvedUser, setResolvedUser] = useState<User | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);

  // Auth guard: if no user, go to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Whenever context user changes, reset resolvedUser baseline
  useEffect(() => {
    if (user) {
      setResolvedUser(user);
    }
  }, [user]);

  // Enrich user with team info (if team is missing but teamId exists)
  useEffect(() => {
    const enrichUserWithTeam = async () => {
      if (!user || isLoading) return;

      // Already have team info → nothing to do
      if ((user as any).team && (user as any).team.name) return;

      // No teamId → nothing to look up
      if (!user.teamId) return;

      try {
        setIsEnriching(true);
        const res = await fetch("/api/user");

        if (!res.ok) {
          console.warn("Failed to enrich user team info:", res.status);
          return;
        }

        const data = await res.json();
        if (!Array.isArray(data)) return;

        const fullUser = data.find((u: User) => u.id === user.id);
        if (fullUser) {
          setResolvedUser(fullUser);
        }
      } catch (err) {
        console.error("Error enriching user with team:", err);
      } finally {
        setIsEnriching(false);
      }
    };

    enrichUserWithTeam();
  }, [user, isLoading]);

  if (isLoading || !user || !resolvedUser) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-sm animate-pulse">Loading your dashboard...</div>
      </div>
    );
  }

  const currentUser = resolvedUser;

  const initial =
    currentUser.name?.trim().charAt(0).toUpperCase() ||
    currentUser.email.charAt(0).toUpperCase();

  const roleLabelMap: Record<Role, string> = {
    [Role.ADMIN]: "Administrator",
    [Role.MANAGER]: "Team Manager",
    [Role.USER]: "Standard User",
    [Role.GUEST]: "Guest User",
  };

  const roleBadgeClass =
    currentUser.role === Role.ADMIN
      ? "bg-red-100 text-red-800"
      : currentUser.role === Role.MANAGER
      ? "bg-purple-100 text-purple-800"
      : currentUser.role === Role.USER
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-700";

  const subtitle =
    currentUser.role === Role.ADMIN
      ? "You have full administrative control across users and teams."
      : currentUser.role === Role.MANAGER
      ? "You can view and manage members of your assigned team."
      : currentUser.role === Role.USER
      ? "You have access to your personal workspace and team context."
      : "Limited access. Contact an administrator if you need more permissions.";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-sm">{subtitle}</p>
        {isEnriching && (
          <p className="text-[11px] text-slate-400">
            Syncing latest team information...
          </p>
        )}
      </header>

      {/* Main card */}
      <div className="p-6 rounded-lg border shadow-sm bg-white/80">
        {/* User identity */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-500/30 border border-blue-200 flex items-center justify-center text-blue-700 text-2xl font-bold">
              {initial}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{currentUser.name}</h2>
              <p className="text-sm">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass}`}
            >
              {roleLabelMap[currentUser.role]} ({currentUser.role})
            </span>
            <span className="text-[11px] text-slate-400">
              Account created{" "}
              {currentUser.createdAt
                ? new Date(currentUser.createdAt as any).toLocaleDateString()
                : "–"}
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role / access summary */}
          <div className="p-4 rounded-lg border bg-slate-50/70">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2">
              Access & Role
            </h3>
            <p className="text-sm mb-3">
              You are signed in as{" "}
              <span className="font-semibold">
                {roleLabelMap[currentUser.role]}
              </span>
              .
            </p>
            <ul className="text-xs space-y-1">
              {currentUser.role === Role.ADMIN && (
                <>
                  <li>• View and manage all users</li>
                  <li>• Assign roles and teams</li>
                  <li>• Access admin tools and reports</li>
                </>
              )}
              {currentUser.role === Role.MANAGER && (
                <>
                  <li>• View members of your team</li>
                  <li>• Monitor team composition</li>
                </>
              )}
              {currentUser.role === Role.USER && (
                <>
                  <li>• View your profile and team information</li>
                  <li>• Access general portal features</li>
                </>
              )}
              {currentUser.role === Role.GUEST && (
                <>
                  <li>• Limited access to basic features</li>
                  <li>• Contact admin for additional permissions</li>
                </>
              )}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              {currentUser.role === Role.ADMIN && (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/admin")}
                    className="text-xs px-3 py-1 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
                  >
                    Go to Admin Panel
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/manager")}
                    className="text-xs px-3 py-1 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
                  >
                    View Team Overview
                  </button>
                </>
              )}
              {currentUser.role === Role.MANAGER && (
                <button
                  type="button"
                  onClick={() => router.push("/manager")}
                  className="text-xs px-3 py-1 rounded border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  Open Team Overview
                </button>
              )}
            </div>
          </div>

          {/* Team info */}
          <div className="p-4 rounded-lg border">
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2">
              Team
            </h3>
            {currentUser.team ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {currentUser.team.name}
                </p>
                {currentUser.team.code && (
                  <p className="text-xs">
                    Team Code:{" "}
                    <span className="font-mono">{currentUser.team.code}</span>
                  </p>
                )}
                {currentUser.team.desccription && (
                  <p className="text-xs mt-2">
                    {currentUser.team.desccription}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">No team assigned</p>
                <p className="text-xs">
                  You are currently not part of any team. If this seems wrong,
                  please contact your manager or an administrator.
                </p>
                {/* Optional: show raw teamId as debug */}
                {currentUser.teamId && (
                  <p className="text-[11px] text-slate-400">
                    (Team ID present: {currentUser.teamId}, but team details
                    were not loaded.)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
