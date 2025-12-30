"use client";

import { useState } from "react";
import axios from "axios";
import BlogTable from "./BlogTable";

const BlogManager = ({ initialPosts = [], isAdmin = false, currentUserId }) => {
  const [posts, setPosts] = useState(initialPosts);

  const onPublishToggle = async (post) => {
    const action = post.status === "published" ? "unpublish" : "publish";
    const res = await axios.put(`/api/blog/${post._id}/publish`, { action });
    const updated = res.data;
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const onDelete = async (post) => {
    await axios.delete(`/api/blog/${post._id}`);
    setPosts((prev) => prev.filter((p) => p._id !== post._id));
  };

  const onEdit = (post) => {
    const base = isAdmin ? "/dashboard/admin/blog" : "/dashboard/assistant/blog";
    window.location.href = `${base}/${post._id}/edit`;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <a
          className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 w-full md:w-auto text-center"
          href={isAdmin ? "/dashboard/admin/blog/new" : "/dashboard/assistant/blog/new"}
        >
          New Post
        </a>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <div className="hidden md:block">
          <BlogTable
            posts={posts}
            onPublishToggle={onPublishToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
          />
        </div>
        {/* Mobile/card view */}
        <div className="md:hidden space-y-3">
          {posts.length === 0 ? (
            <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-slate-600 text-center">No blog posts yet.</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="rounded-lg border border-blue-100 bg-white p-4">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-semibold text-blue-900 truncate">{post.title}</div>
                  <div className="text-xs text-slate-700 truncate">/{post.slug}</div>
                  <div className="text-xs text-slate-900">By {post.author?.name || post.author?.username || "-"}</div>
                  <div className="text-xs">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${post.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">Updated: {new Date(post.updatedAt).toLocaleDateString()}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => onPublishToggle(post)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${post.status === "published" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  )}
                  {(isAdmin || String(post.author?._id) === String(currentUserId)) ? (
                    <button
                      onClick={() => onEdit(post)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic">View only</span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => onDelete(post)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  )}
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 hover:bg-blue-100 transition"
                  >
                    View
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManager;
