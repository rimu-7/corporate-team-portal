"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 ">My Dashboard</h1>
      
      <div className=" p-6 rounded-lg shadow border ">
        <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {user.name.charAt(0)}
            </div>
            <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="">{user.email}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4  rounded border">
                <h3 className="text-sm font-bold  uppercase mb-1">Role</h3>
                <p className="font-medium">{user.role}</p>
            </div>
            <div className="p-4  rounded border">
                <h3 className="text-sm font-bold  uppercase mb-1">Team</h3>
                <p className="font-medium">
                    {user.team ? user.team.name : "No Team Assigned"}
                </p>
                {user.team?.code && <span className="text-xs ">{user.team.code}</span>}
            </div>
        </div>
      </div>
    </div>
  );
}