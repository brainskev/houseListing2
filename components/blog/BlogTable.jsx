"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const BlogTable = ({ posts = [], onPublishToggle, onEdit, onDelete, isAdmin = false, currentUserId }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handlePublishToggle = async (post) => {
    // Only admins can publish/unpublish
    if (!isAdmin) return;
    setLoadingId(post._id);
    try {
      await onPublishToggle(post);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-h-[70vh] overflow-auto">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blue-100">
          <thead className="bg-blue-50">
          <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-blue-100">
          {posts.map((post) => (
              <tr key={post._id} className="hover:bg-blue-50/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-blue-700 hover:underline">
                  {post.title}
                </Link>
                <div className="text-xs text-slate-700">/{post.slug}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-slate-900">{post.author?.name || post.author?.username || "-"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                  {post.status}
                </span>
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {new Date(post.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {/* Publish/Unpublish: admins only */}
                {isAdmin && (
                  <button
                    onClick={() => handlePublishToggle(post)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${post.status === "published" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    disabled={loadingId === post._id}
                  >
                    {post.status === "published" ? (
                      <><FaTimesCircle /> Unpublish</>
                    ) : (
                      <><FaCheckCircle /> Publish</>
                    )}
                  </button>
                )}

                {(isAdmin || String(post.author?._id) === String(currentUserId)) ? (
                  <button
                    onClick={() => onEdit(post)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">View only</span>
                )}

                {isAdmin ? (
                  <button
                    onClick={() => onDelete(post)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <FaTrash /> Delete
                  </button>
                ) : null}

                <Link
                  href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
                >
                  <FaEye /> View
                </Link>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlogTable;
