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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        <a
          className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700"
          href={isAdmin ? "/dashboard/admin/blog/new" : "/dashboard/assistant/blog/new"}
        >
          New Post
        </a>
      </div>
      <BlogTable
        posts={posts}
        onPublishToggle={onPublishToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default BlogManager;
