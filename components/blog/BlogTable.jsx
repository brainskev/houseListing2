"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash, FaEye, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const BlogTable = ({ posts = [], onPublishToggle, onEdit, onDelete, isAdmin = false, currentUserId }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handlePublishToggle = async (post) => {
    if (!isAdmin) return;
    setLoadingId(post._id);
    try {
      await onPublishToggle(post);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link href={`/blog/${post.slug}`} className="text-sm font-medium text-brand-600 hover:underline">
                  {post.title}
                </Link>
                <div className="text-xs text-gray-500">/{post.slug}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{post.author?.name || post.author?.username || "-"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                  {post.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(post.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {isAdmin ? (
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
                ) : null}

                {(isAdmin || String(post.author?._id) === String(currentUserId)) ? (
                  <button
                    onClick={() => onEdit(post)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 italic">View only</span>
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
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                >
                  <FaEye /> View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogTable;
