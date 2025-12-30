"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserManagementTable from "@/components/dashboard/UserManagementTable";
import { toast } from "react-toastify";
import useCacheFetch from "@/hooks/useCacheFetch";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const { data, loading, error, refresh } = useCacheFetch("/api/users", { cache: "no-store" }, 3000);
  const users = data?.users || [];

  const handleUpdate = async (userId, updateData) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to update user");
      }
      toast.success("User updated successfully");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to delete user");
      }
      toast.success("User deleted successfully");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout role="admin" title="User Management">
      {loading && <p className="text-sm text-slate-500">Loading users...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className="text-sm text-slate-500">No users found.</p>
      )}
      {!loading && !error && users.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Total users: <span className="font-semibold">{users.length}</span>
            </p>
          </div>
          <UserManagementTable
            users={users}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            userRole={userRole}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
