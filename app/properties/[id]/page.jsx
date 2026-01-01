"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { fetchProperty } from "@/utils/requests";
import Spinner from "@/components/Spinner";
import ImageCarousel from "@/components/ImageCarousel";
import KeyDetails from "@/components/KeyDetails";
import DescriptionSection from "@/components/DescriptionSection";
import PropertyMap from "@/components/PropertyMap";
import SimilarListings from "@/components/SimilarListings";
import ContactAgentCard from "@/components/ContactAgentCard";
import PropertyContactForm from "@/components/PropertyContactForm";
import { useSession } from "next-auth/react";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
const PropertyPage = () => {
  const { id } = useParams();
  const { data: session } = useSession();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;
      try {
        const property = await fetchProperty(id);
        setProperty(property);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (property === null) {
      fetchPropertyData();
    }
  }, [id, property]);

  if (property?.length === 0 && !loading) {
    return (
      <h1 className="text-center text-2xl font-bold mt-10">
        Property Not Found
      </h1>
    );
  }

  return (
    <>
      {loading && <Spinner loading={loading} />}
      {!loading && property && (
        <main className="bg-gray-50 min-h-screen">
          <ImageCarousel images={property.images} />

          <div className="container mx-auto px-4 py-6">
            <Link
              href="/properties"
              className="text-brand-600 hover:text-brand-700 flex items-center mb-4 text-sm font-medium"
            >
              <FaArrowLeft className="mr-2" /> Back to Properties
            </Link>

            {/* Address + Price header */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">For Sale</p>
                  <h1 className="text-3xl font-bold text-gray-900">${property?.rates?.price?.toLocaleString() || "Price on request"}</h1>
                  <p className="text-lg text-gray-700 mt-1">
                    {property?.location?.street && `${property.location.street}, `}
                    {property?.location?.city}, {property?.location?.state} {property?.location?.zipcode}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
                  <BookmarkButton property={property} className="!px-3 !py-2 text-sm" />
                  <ShareButton property={property} className="!px-3 !py-2 text-sm" />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <KeyDetails
                  beds={property?.beds}
                  baths={property?.baths}
                  squareFeet={property?.square_feet}
                  lotSize={property?.lot_size || "—"}
                  yearBuilt={property?.year_built || "—"}
                  propertyType={property?.type}
                />

                <DescriptionSection description={property?.description} />

                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                  <PropertyMap property={property} />
                </section>

                <SimilarListings
                  currentId={property?._id}
                  city={property?.location?.city}
                  type={property?.type}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Interested?</h3>
                  <p className="text-sm text-gray-600">Book a tour or reach out below. We’ll tie your request to this property.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href={
                        session
                          ? `/dashboard/user/appointment?propertyId=${property?._id}&propertyName=${encodeURIComponent(
                              property?.name || ""
                            )}`
                          : `/login?callbackUrl=/dashboard/user/appointment?propertyId=${property?._id}&propertyName=${encodeURIComponent(
                              property?.name || ""
                            )}`
                      }
                      className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                    >
                      Book a Viewing
                    </Link>
                  </div>
                  {!session && (
                    <p className="text-xs text-gray-500">You’ll be prompted to log in, then returned to continue.</p>
                  )}
                </div>

                <ContactAgentCard>
                  <PropertyContactForm property={property} />
                </ContactAgentCard>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );
};

export default PropertyPage;
