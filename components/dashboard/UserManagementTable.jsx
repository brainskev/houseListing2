"use client";

import { useState } from "react";
import Image from "next/image";
import { FaEdit, FaTrash, FaBan, FaCheck } from "react-icons/fa";

const UserManagementTable = ({ users, onUpdate, onDelete, userRole = "admin" }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const isAdmin = userRole === "admin";

  const handleRoleChange = async (userId, newRole) => {
    await onUpdate(userId, { role: newRole });
    setEditingRole(null);
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    await onUpdate(userId, { status: newStatus });
  };

  const handleDelete = async (userId) => {
    await onDelete(userId);
    setDeleteModal(null);
  };

  // Ensure admins and assistants appear at the top
  const rolePriority = { admin: 0, assistant: 1, user: 2 };
  const sortedUsers = Array.isArray(users)
    ? [...users].sort((a, b) => {
        const pa = rolePriority[a.role] ?? 3;
        const pb = rolePriority[b.role] ?? 3;
        if (pa !== pb) return pa - pb;
        // Secondary sort by created date (newer first) to keep ordering consistent
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return db - da;
      })
    : [];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.image ? (
                        <Image
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.image}
                          alt={user.name || "User avatar"}
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isAdmin && editingRole === user._id ? (
                    <select
                      defaultValue={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      onBlur={() => setEditingRole(null)}
                      autoFocus
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="user">User</option>
                      <option value="assistant">Assistant</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => isAdmin && setEditingRole(user._id)}
                      disabled={!isAdmin}
                      className={`inline-flex items-center gap-1 text-sm font-medium text-gray-900 ${isAdmin ? 'hover:text-brand-600 cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "assistant"
                            ? "bg-brand-100 text-brand-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                      {isAdmin && <FaEdit className="text-xs" />}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => handleStatusToggle(user._id, user.status)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
                          user.status === "active"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.status === "active" ? (
                          <>
                            <FaBan /> Block
                          </>
                        ) : (
                          <>
                            <FaCheck /> Unblock
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteModal(user)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 italic">View only</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteModal.name || deleteModal.email}</span>?
              This will permanently delete the user and all associated data (properties,
              enquiries, appointments).
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementTable;
