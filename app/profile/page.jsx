"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import profileDefault from "@/assets/images/profile.png";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", image: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setForm({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          image: data.image || session?.user?.image || "",
        });
        setHasPassword(Boolean(data.hasPassword));
      } catch (err) {
        toast.error("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const onPwdChange = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onPasswordSave = async (e) => {
    e.preventDefault();
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.error("Provide both current and new password");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Password update failed");
      toast.success("Password updated");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.message || "Password update failed");
    } finally {
      setSaving(false);
    }
  };

  const profileImage = form.image || session?.user?.image || profileDefault;

  return (
    <section className="bg-brand-50">
      <div className="container m-auto py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>
          {loading ? (
            <Spinner loading={loading} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="flex flex-col items-center text-center">
                  <Image
                    className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover ring-2 ring-brand-200"
                    src={profileImage}
                    alt="User"
                    width={160}
                    height={160}
                  />
                  <p className="mt-4 text-gray-600">Update your profile details</p>
                </div>
              </div>

              <div className="md:col-span-2">
                <form onSubmit={onSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={onChange}
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="Username"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                      <input
                        type="url"
                        name="image"
                        value={form.image}
                        onChange={onChange}
                        className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-md shadow-sm disabled:opacity-50"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>

                {hasPassword ? (
                  <div className="mt-10 border-t pt-8">
                    <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                    <form onSubmit={onPasswordSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={pwd.currentPassword}
                          onChange={onPwdChange}
                          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={pwd.newPassword}
                          onChange={onPwdChange}
                          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="••••••"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-md shadow-sm disabled:opacity-50"
                          disabled={saving}
                        >
                          {saving ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="mt-10 border-t pt-8">
                    <h2 className="text-xl font-semibold mb-2">Password Managed by Google</h2>
                    <p className="text-gray-600">This account uses Google sign-in. Password changes are not available here.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
