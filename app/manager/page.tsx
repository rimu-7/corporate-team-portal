"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Role, User } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ManagerPanel() {
  const { user, isLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → send to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Logged in but not Manager/Admin → back to dashboard
    if (user.role !== Role.MANAGER && user.role !== Role.ADMIN) {
      router.push("/dashboard");
      return;
    }

    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        setError(null);

        const res = await fetch("/api/user");

        if (!res.ok) {
          let msg = `Failed to load team members (${res.status})`;
          try {
            const data = await res.json();
            if (data?.error) msg = data.error;
          } catch {
            // ignore JSON parse error
          }
          throw new Error(msg);
        }

        const data = await res.json();
        setTeamMembers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching team members:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading team members."
        );
        setTeamMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-sm text-slate-500 animate-pulse">
          Verifying your access...
        </div>
      </div>
    );
  }

  // Derive team label:
  // 1) Prefer auth user's team
  // 2) Fallback to any member's team (if RBAC returns only that team)
  const derivedTeamName = useMemo(() => {
    if (user.team?.name) return user.team.name;
    const teamFromMembers = teamMembers.find((m) => m.team?.name)?.team?.name;
    return teamFromMembers || null;
  }, [user.team, teamMembers]);

  const teamLabel = derivedTeamName || "Team Overview";

  const roleBadgeClass =
    user.role === Role.ADMIN
      ? "bg-red-100 text-red-800"
      : "bg-purple-100 text-purple-800";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 ">
            Team Overview
          </h1>
          <p className="text-sm text-slate-500">
            View all members currently assigned under your visibility scope.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass}`}
          >
            {user.role === Role.ADMIN ? "Admin View" : "Manager View"}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-100">
            {teamLabel}
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border shadow-sm bg-white/80  overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Loading skeleton */}
            {membersLoading && teamMembers.length === 0 && !error && (
              <>
                {[0, 1, 2].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-3 w-28 bg-slate-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-40 bg-slate-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-24 bg-slate-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-16 bg-slate-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Members */}
            {!membersLoading &&
              teamMembers.map((member) => {
                const roleClass =
                  member.role === Role.MANAGER
                    ? "bg-purple-100 text-purple-800"
                    : member.role === Role.ADMIN
                    ? "bg-red-100 text-red-800"
                    : member.role === Role.USER
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700";

                const isYou = member.id === user.id;

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/70 "
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-slate-900 ">
                          {member.name}
                        </span>
                        {isYou && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 ">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 ">
                        {member.team?.name || "Unassigned"}
                        {member.team?.code && (
                          <span className="ml-2 text-[11px] text-slate-400 font-mono">
                            ({member.team.code})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 ">
                      {member.createdAt
                        ? new Date(
                            // allow Date | string
                            member.createdAt as any
                          ).toLocaleDateString()
                        : "–"}
                    </td>
                  </tr>
                );
              })}

            {/* Empty state */}
            {!membersLoading && teamMembers.length === 0 && !error && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-6 text-center text-sm text-slate-500"
                >
                  No members found in your current team view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
