"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import PropertyCard from "@/components/PropertyCard";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import MessageCard from "@/components/messages/MessageCard";

const SectionTitle = ({ children }) => (
  <h2 className="mb-4 text-xl font-semibold text-gray-900">{children}</h2>
);

const UserDashboard = ({ hideSidebar = false }) => {
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadRecommended = async () => {
    setLoading(true);
    try {
      // 1) Bookmarks
      let bookmarked = [];
      try {
        const bm = await axios.get("/api/bookmark");
        bookmarked = Array.isArray(bm?.data) ? bm.data : [];
      } catch {}

      // 2) Featured listings
      let featured = [];
      try {
        const f = await axios.get("/api/properties/featured");
        featured = Array.isArray(f?.data) ? f.data : [];
      } catch {}

      // 3) Merge and dedupe
      const merged = [...bookmarked, ...featured];
      const unique = [];
      const seen = new Set();
      for (const p of merged) {
        if (p && p._id && !seen.has(p._id)) {
          seen.add(p._id);
          unique.push(p);
        }
        if (unique.length >= 6) break;
      }

      // 4) Final fallback to general properties until we have up to 6
      if (unique.length < 6) {
        try {
          const res = await axios.get("/api/properties", { params: { page: 1, pageSize: 12 } });
          const list = Array.isArray(res?.data?.properties) ? res.data.properties : [];
          for (const p of list) {
            if (!p?._id) continue;
            if (!seen.has(p._id)) {
              seen.add(p._id);
              unique.push(p);
              if (unique.length >= 6) break;
            }
          }
        } catch {}
      }

      // 5) As a last resort, ensure at least fallback placeholders (avoid empty UI)
      setRecommended(unique);
    } catch (err) {
      // In case everything fails, recommended should still be non-empty: try general properties quickly
      try {
        const res = await axios.get("/api/properties", { params: { page: 1, pageSize: 6 } });
        const list = Array.isArray(res?.data?.properties) ? res.data.properties : [];
        setRecommended(list);
      } catch {
        setRecommended([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/bookmark");
      setBookmarks(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/messages/sent");
      setEnquiries(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/appointments");
      const arr = Array.isArray(res?.data?.appointments)
        ? res.data.appointments
        : [];
      setAppointments(arr);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial recommended on mount
    loadRecommended();
  }, []);

  useEffect(() => {
    if (tab === "bookmarks") loadBookmarks();
    else if (tab === "enquiries") loadEnquiries();
    else if (tab === "appointments") loadAppointments();
    else if (tab === "dashboard") loadRecommended();
  }, [tab]);

  const upcoming = useMemo(
    () => appointments.filter((a) => new Date(a.date) > new Date()),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter((a) => new Date(a.date) <= new Date()),
    [appointments]
  );

  const Wrapper = ({ children }) => (
    hideSidebar ? <>{children}</> : (
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">{children}</div>
    )
  );

  return (
    <Wrapper>
      {!hideSidebar && (
        <div>
          <Sidebar current={tab} onChange={setTab} />
        </div>
      )}
      <div>
        {tab === "dashboard" && (
          <section>
            <SectionTitle>Recommended Properties</SectionTitle>
            {loading ? (
              <Spinner />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommended.slice(0, 6).map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "bookmarks" && (
          <section>
            <SectionTitle>My Bookmarks</SectionTitle>
            {loading ? (
              <Spinner />
            ) : bookmarks.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No saved properties yet.</p>
            )}
          </section>
        )}

        {tab === "enquiries" && (
          <section>
            <SectionTitle>My Enquiries</SectionTitle>
            {loading ? (
              <Spinner />
            ) : enquiries.length ? (
              <div className="space-y-3">
                {enquiries.map((m) => (
                  <MessageCard
                    key={m._id}
                    m={m}
                    context="sent"
                    onUpdated={loadEnquiries}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600">You haven&apos;t sent any enquiries yet.</p>
            )}
          </section>
        )}

        {tab === "appointments" && (
          <section className="space-y-6">
            <div>
              <SectionTitle>Upcoming Appointments</SectionTitle>
              {loading ? (
                <Spinner />
              ) : upcoming.length ? (
                <ul className="space-y-3">
                  {upcoming.map((a) => (
                    <li key={a._id} className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-sm">
                      <p className="font-semibold text-gray-900">{a.propertyId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {a.propertyId?.location?.city}, {a.propertyId?.location?.state}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">{new Date(a.date).toLocaleString()}</p>
                      <StatusBadge className="mt-2" status={a.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No upcoming appointments.</p>
              )}
            </div>
            <div>
              <SectionTitle>Past Appointments</SectionTitle>
              {loading ? (
                <Spinner />
              ) : past.length ? (
                <ul className="space-y-3">
                  {past.map((a) => (
                    <li key={a._id} className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-soft backdrop-blur-sm">
                      <p className="font-semibold text-gray-900">{a.propertyId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {a.propertyId?.location?.city}, {a.propertyId?.location?.state}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">{new Date(a.date).toLocaleString()}</p>
                      <StatusBadge className="mt-2" status={a.status || "Completed"} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No past appointments.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </Wrapper>
  );
};

export default UserDashboard;
