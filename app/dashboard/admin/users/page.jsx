"use client";

import { useCallback, useEffect, useState } from "react";
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
    try {
      setLoading(true);
      const res = await fetch("/api/users", { cache: "no-store" });
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data?.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
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
      toast.success("User updated successfully");
      fetchUsers();
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
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout role="admin" title="User Management" countsEnabled={false} session={session}>
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
