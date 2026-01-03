"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaStar, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function TestimonialsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    const role = session?.user?.role;
    if (!["admin", "assistant"].includes(role)) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/testimonials?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update testimonial");

      toast.success(`Testimonial ${status}`);
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || "Failed to update testimonial");
    }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete testimonial");

      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch (error) {
      toast.error(error.message || "Failed to delete testimonial");
    }
  };

  if (status === "loading" || !session) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout
      role={session?.user?.role}
      title="Testimonials Management"
      session={session}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition ${
                  filter === status
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : testimonials.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No {filter} testimonials</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial._id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-col gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                        {testimonial.name}
                      </h3>
                      <span className="text-xs sm:text-sm text-slate-500">
                        {testimonial.role}
                      </span>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="h-3 w-3 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mb-2 text-xs sm:text-sm text-slate-600">
                      {testimonial.userId?.name} ({testimonial.userId?.email})
                    </p>
                    <p className="text-sm sm:text-base text-slate-700">{testimonial.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Submitted: {new Date(testimonial.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {testimonial.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(testimonial._id, "approved")}
                        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        <FaCheck className="text-xs sm:text-sm" /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(testimonial._id, "rejected")}
                        className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        <FaTimes className="text-xs sm:text-sm" /> Reject
                      </button>
                    </>
                  )}
                  {testimonial.status === "approved" && (
                    <button
                      onClick={() => updateStatus(testimonial._id, "rejected")}
                      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-amber-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-amber-700"
                    >
                      <FaTimes className="text-xs sm:text-sm" /> Unapprove
                    </button>
                  )}
                  {testimonial.status === "rejected" && (
                    <button
                      onClick={() => updateStatus(testimonial._id, "approved")}
                      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <FaCheck className="text-xs sm:text-sm" /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteTestimonial(testimonial._id)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-slate-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    <FaTrash className="text-xs sm:text-sm" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
