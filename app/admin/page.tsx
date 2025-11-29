"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Role, User } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();
  const [message, setMessage] = useState("");

  // Hardcoded for demo - ideally fetch from /api/teams
  const teams = [
    { id: "", name: "No Team" },
    { id: "cm4238e550000u9208y8e8w4a", name: "Engineering" }, // Replace with real IDs from your DB seed
    { id: "cm4238e550001u920xyz12345", name: "Marketing" }, // Replace with real IDs
    { id: "cm4238e550002u920abc67890", name: "Operations" }, // Replace with real IDs
  ];

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== Role.ADMIN) {
        router.push("/dashboard");
        return;
      }
      refreshUsers();
    }
  }, [user, isLoading, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMessage("");
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        refreshUsers();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleTeamChange = async (userId: string, teamId: string) => {
    setMessage("");
    try {
      const res = await fetch(`/api/user/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: teamId === "" ? "" : teamId }), // Send empty string to remove
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Success: ${data.message}`);
        refreshUsers();
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert("Failed to update team");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 ">System Administration</h1>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
          {message}
        </div>
      )}

      <div className=" rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y-4">
          <thead className="">
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
          <tbody className=" divide-y-2">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-green-500">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium ">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>

                {/* Role Display */}
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-300">
                    {u.role}
                  </span>
                </td>

                {/* Role Actions */}
                <td className="px-6 py-4">
                  <select
                    className="text-sm border rounded p-1"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === user?.id} // Cannot change own role
                  >
                    <option value="USER">User</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>

                {/* Team Display */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {u.team ? u.team.name : "Unassigned"}
                </td>

                {/* Team Actions */}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {/* Note: In a real app, you'd fetch teams from an API to populate this dropdown */}
                    <input
                      type="text"
                      placeholder="Paste Team ID"
                      className="text-xs border rounded p-1 w-32"
                      onBlur={(e) => {
                        if (e.target.value)
                          handleTeamChange(u.id, e.target.value);
                      }}
                    />
                    <button
                      onClick={() => handleTeamChange(u.id, "")}
                      className="text-xs text-red-600 hover:text-red-800"
                      title="Remove from team"
                    >
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
