"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaMapMarker, FaDollarSign } from "react-icons/fa";
import BookmarkButton from "@/components/BookmarkButton";
import EnquiryModal from "@/components/EnquiryModal";
import BookingModal from "@/components/BookingModal";

const RecommendedPropertyCard = ({ property }) => {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const getPrice = () => {
    const r = property?.rates || {};
    if (r.price) return `$${r.price.toLocaleString()}`;
    if (r.monthly) return `$${r.monthly.toLocaleString()}/mo`;
    if (r.weekly) return `$${r.weekly.toLocaleString()}/wk`;
    if (r.nightly) return `$${r.nightly.toLocaleString()}/night`;
    return "";
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
      <div className="relative h-40 w-full">
        <Image
          src={property.images?.[0]}
          alt={property.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 rounded bg-brand-600 px-3 py-1 text-white text-sm font-semibold">
          {getPrice()}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <Link href={`/properties/${property?._id}`} className="block">
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 hover:underline">
            {property?.name}
          </h3>
        </Link>
        <div className="flex items-center text-gray-600 text-sm">
          <FaMapMarker className="mr-2 text-orange-600" />
          <span>
            {property?.location?.city}, {property?.location?.state}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <button
            onClick={() => setEnquiryOpen(true)}
            className="rounded bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Enquire
          </button>
          <button
            onClick={() => setBookingOpen(true)}
            className="rounded bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
          >
            Book Viewing
          </button>
          <BookmarkButton property={property} />
        </div>
      </div>

      <EnquiryModal open={enquiryOpen} onClose={() => setEnquiryOpen(false)} property={property} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} property={property} />
    </div>
  );
};

export default RecommendedPropertyCard;
