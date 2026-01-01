"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaDownload, FaEnvelope, FaSpinner, FaCalendar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function NewsletterSubscribersPage() {
  const { data: session, status } = useSession();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/newsletter/subscribers", {
          params: {
            page: currentPage,
            pageSize: pageSize,
          },
        });
        setSubscribers(response.data.subscribers);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        toast.error("Failed to load newsletter subscribers");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchSubscribers();
    }
  }, [status, session, currentPage, pageSize]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axios.get("/api/newsletter/export", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Newsletter subscribers exported successfully!");
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      toast.error("Failed to export newsletter subscribers");
    } finally {
      setExporting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout role="admin" title="Newsletter Subscribers" session={session}>
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-brand-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (session?.user?.role !== "admin") {
    return (
      <DashboardLayout role="admin" title="Newsletter Subscribers" session={session}>
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold">Access Denied - Admin Only</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Newsletter Subscribers" session={session}>
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <p className="text-gray-600 mt-1">
              Total Subscribers: <span className="font-semibold">{pagination.total}</span>
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || pagination.total === 0}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {exporting ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaDownload />
            )}
            Export as CSV
          </button>
        </div>

        {/* Page Size Selector */}
        <div className="mb-6 flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Show per page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>

        {/* Subscribers Table */}
        {pagination.total === 0 ? (
          <div className="text-center py-12">
            <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No newsletter subscribers yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber, index) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-brand-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendar className="text-gray-400" />
                        {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {Math.min((currentPage - 1) * pageSize + 1, pagination.total)} to{' '}
                {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} subscribers
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                  aria-label="Previous page"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: pagination.totalPages || 1 }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      currentPage === i + 1
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.totalPages || 1, currentPage + 1))}
                  disabled={currentPage >= (pagination.totalPages || 1)}
                  className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition"
                  aria-label="Next page"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
