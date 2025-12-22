"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";

const initialState = {
  title: "",
  slug: "",
  content: "",
  status: "draft",
  featuredImageFile: null,
  galleryFiles: [],
};

const BlogEditor = ({ post, isAdmin = false }) => {
  const [form, setForm] = useState(() => {
    if (post) {
      return {
        title: post.title || "",
        slug: post.slug || "",
        content: post.content || "",
        status: post.status || "draft",
        featuredImageFile: null,
        galleryFiles: [],
      };
    }
    return initialState;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "featuredImage") {
      setForm((prev) => ({ ...prev, featuredImageFile: files[0] || null }));
    } else if (name === "gallery") {
      setForm((prev) => ({ ...prev, galleryFiles: Array.from(files || []) }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("content", form.content);
      fd.append("status", isAdmin ? form.status : "draft");
      if (form.featuredImageFile) fd.append("featuredImage", form.featuredImageFile);
      for (const f of form.galleryFiles) fd.append("gallery", f);

      if (post?._id) {
        // Update via JSON for simplicity; images can be updated via separate flows if needed
        await axios.put(`/api/blog/${post._id}`, {
          title: form.title,
          slug: form.slug,
          content: form.content,
        });
      } else {
        await axios.post("/api/blog", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      window.history.back();
    } catch (err) {
      setError(err?.response?.data || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 relative">
      {saving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <Spinner loading={true} />
        </div>
      )}
      {error ? (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      ) : null}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-60"
          required
          disabled={saving}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={onChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-60"
          placeholder="auto-generated if left empty"
          disabled={saving}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content</label>
        <textarea
          name="content"
          value={form.content}
          onChange={onChange}
          rows={12}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-60"
          placeholder="Write your post..."
          required
          disabled={saving}
        />
        <p className="mt-1 text-xs text-gray-500">Supports headings, lists, and paragraphs (HTML allowed).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Featured Image</label>
          <input type="file" name="featuredImage" accept="image/*" onChange={onFileChange} className="mt-1" disabled={saving} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gallery Images</label>
          <input type="file" name="gallery" accept="image/*" multiple onChange={onFileChange} className="mt-1" disabled={saving} />
        </div>
      </div>
      {isAdmin ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-60"
            disabled={saving}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      ) : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60 inline-flex items-center gap-2"
        >
          {saving ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
          ) : null}
          {saving ? (post?._id ? "Saving..." : "Creating...") : (post?._id ? "Save Changes" : "Create Post")}
        </button>
      </div>
    </form>
  );
};

export default BlogEditor;
