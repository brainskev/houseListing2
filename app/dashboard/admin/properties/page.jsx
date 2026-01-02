"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminPropertiesPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === "admin";
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Request a large page size to avoid the 6-item default
      const res = await fetch("/api/properties?page=1&pageSize=1000", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load properties");
      }
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (propertyId) => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message || "Failed to delete property");
      }
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      toast.success("Property deleted successfully");
      setDeleteModal(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout role="admin" title="Property Management" session={session}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Total properties: <span className="font-semibold">{properties.length}</span>
          </p>
          <Link
            href="/properties/add"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <FaPlus /> Add Property
          </Link>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading properties...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && properties.length === 0 && (
          <p className="text-sm text-slate-500">No properties found.</p>
        )}

        {!loading && !error && properties.length > 0 && (
          <div className="grid gap-4 max-h-[70vh] overflow-auto pr-1">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Property Image and Info - Clickable */}
                  <Link
                    href={`/properties/${property._id}`}
                    className="flex items-start gap-4 flex-1 p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex-shrink-0">
                      {property.images?.[0] ? (
                        <Image
                          className="h-20 w-28 rounded-lg object-cover"
                          src={property.images[0]}
                          alt={property.name}
                          width={112}
                          height={80}
                        />
                      ) : (
                        <div className="h-20 w-28 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                        {property.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-brand-100 text-brand-800">
                          {property.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          {property.location?.city}, {property.location?.state}
                        </span>
                      </div>
                      {/* Owner / Seller Info */}
                      <div className="mb-2 text-xs text-gray-600">
                        {property.seller_info?.name || property.seller_info?.email || property.owner ? (
                          <span>
                            Owner: {property.seller_info?.name ? property.seller_info.name : "Unknown"}
                            {property.seller_info?.email ? ` · ${property.seller_info.email}` : ""}
                            {property.seller_info?.phone ? ` · ${property.seller_info.phone}` : ""}
                            {(!property.seller_info?.name && property.owner) ? ` · ID: ${property.owner}` : ""}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          {property.rates?.price
                            ? `$${Number(property.rates.price).toLocaleString()}`
                            : property.rates?.monthly
                            ? `$${Number(property.rates.monthly).toLocaleString()}/mo`
                            : "N/A"}
                        </span>
                        <span>{property.beds} beds</span>
                        <span>{property.baths} baths</span>
                        <span>{property.square_feet?.toLocaleString()} sqft</span>
                      </div>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 p-4 sm:items-end border-t sm:border-t-0 sm:border-l border-gray-100">
                    <Link
                      href={`/properties/${property._id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-brand-100 text-brand-700 hover:bg-brand-200 transition whitespace-nowrap"
                    >
                      <FaEdit /> Edit
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteModal(property)}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition whitespace-nowrap"
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Property
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteModal.name}</span>? This action
              cannot be undone.
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
    </DashboardLayout>
  );
}
