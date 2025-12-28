"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserManagementTable from "@/components/dashboard/UserManagementTable";
import { toast } from "react-toastify";

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      const { user } = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? user : u)));
      toast.success("User updated successfully");
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
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
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
