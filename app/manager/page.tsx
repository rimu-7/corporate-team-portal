"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Role, User } from "@/app/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ManagerPanel() {
  const { user, isLoading } = useAuth();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || (user.role !== Role.MANAGER && user.role !== Role.ADMIN)) {
        router.push("/dashboard");
        return;
      }
      
      // Fetch users (The API logic you fixed ensures Managers only see their team)
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => setTeamMembers(Array.isArray(data) ? data : []))
        .catch((err) => console.error(err));
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Team Overview</h1>
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
           {user?.team?.name || "Manager View"}
        </span>
      </div>

      <div className=" rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y-4 ">
          <thead className="">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className=" divide-y-2">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium ">{member.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm ">{member.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${member.role === Role.MANAGER ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                  {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
            {teamMembers.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center ">No members found in your view.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}