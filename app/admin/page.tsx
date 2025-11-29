"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Role, User, Team } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  const refreshTeams = async () => {
    try {
      const res = await fetch("/api/team");
      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server returned non-JSON response: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch teams:", e);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== Role.ADMIN) {
        router.push("/dashboard");
        return;
      }

      // Load users + teams when admin is confirmed
      refreshUsers();
      refreshTeams();
    }
  }, [user, isLoading, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMessage("");
    try {
      const res = await fetch(`/api/user/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server returned non-JSON response: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        refreshUsers();
      } else {
        alert(data.error || "Server Error");
      }
    } catch (e) {
      console.error("Update failed:", e);
      alert(e instanceof Error ? e.message : "Failed to update role");
    }
  };

  const handleTeamChange = async (userId: string, teamId: string) => {
    setMessage("");
    try {
      const res = await fetch(`/api/user/${userId}/team`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: teamId === "" ? "" : teamId }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Server returned non-JSON response: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        refreshUsers();
      } else {
        alert(data.error || "Server Error");
      }
    } catch (e) {
      console.error("Team update failed:", e);
      alert(e instanceof Error ? e.message : "Failed to update team");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Administration</h1>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
          {message}
        </div>
      )}

      <div className="rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y-4">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Current Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Change Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Current Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Assign Team
              </th>
            </tr>
          </thead>
          <tbody className="divide-y-2">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>

                {/* Role Display */}
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      u.role === Role.ADMIN
                        ? "bg-red-100 text-red-800"
                        : u.role === Role.MANAGER
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>

                {/* Role Actions */}
                <td className="px-6 py-4">
                  <select
                    className="text-sm border rounded p-1 disabled:bg-gray-100 disabled:text-gray-400"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === user?.id || u.role === Role.ADMIN}
                  >
                    <option value="USER">User</option>
                    <option value="MANAGER">Manager</option>
                    {u.role === Role.ADMIN && (
                      <option value="ADMIN">Admin</option>
                    )}
                  </select>

                  {u.role === Role.ADMIN && u.id !== user?.id && (
                    <div className="text-[10px] text-red-400 mt-1">
                      Locked (Admin)
                    </div>
                  )}
                </td>

                {/* Team Display */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.team ? u.team.name : "Unassigned"}
                </td>

                {/* Team Actions */}
                <td className="px-6 py-4">
                  {teams.length > 0 ? (
                    <select
                      className="text-sm border rounded p-1 min-w-[150px]"
                      value={u.team?.id || ""}
                      onChange={(e) => handleTeamChange(u.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-400">
                      No teams found. Seed or create teams first.
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
