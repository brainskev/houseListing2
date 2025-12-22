"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProperties } from "@/utils/requests";

const SimilarListings = ({ currentId, city, type }) => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchProperties();
        const props = Array.isArray(data?.properties) ? data.properties : [];
        const filtered = props
          .filter((p) => p._id !== currentId)
          .filter((p) => {
            const cityMatch = city && p?.location?.city?.toLowerCase() === city.toLowerCase();
            const typeMatch = type && p?.type?.toLowerCase() === type.toLowerCase();
            return cityMatch || typeMatch;
          })
          .slice(0, 3);
        setListings(filtered);
      } catch (e) {
        setListings([]);
      }
    };
    load();
  }, [currentId, city, type]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Similar Listings</h2>
        <span className="text-sm text-brand-600">({listings.length})</span>
      </div>
      {listings.length === 0 ? (
        <p className="text-sm text-gray-600">No similar listings found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((p) => (
            <Link
              key={p._id}
              href={`/properties/${p._id}`}
              className="block rounded-lg border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition bg-gray-50"
            >
              <div className="relative h-32 w-full bg-gray-200">
                <Image
                  src={p.images?.[0] || "/properties/placeholder.jpg"}
                  alt={p.name}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>
              <div className="p-3 space-y-1">
                <div className="text-lg font-semibold text-gray-900 truncate">
                  ${p?.rates?.price ? p.rates.price.toLocaleString() : "Price on request"}
                </div>
                <div className="text-sm text-gray-700 font-medium truncate">{p?.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {p?.location?.city}, {p?.location?.state}
                </div>
                <div className="text-xs text-gray-500">{p?.beds} bd • {p?.baths} ba • {p?.square_feet} sqft</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default SimilarListings;
