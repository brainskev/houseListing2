"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import PropertyCard from "@/components/PropertyCard";
import PropertySearchForm from "@/components/PropertySearchForm";
import Pagination from "@/components/Pagination";

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const location = searchParams.get("location");
  const propertyType = searchParams.get("propertyType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (propertyType) params.append("propertyType", propertyType);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        params.append("page", page);
        params.append("pageSize", pageSize);

        const response = await axios.get(
          `/api/properties/search?${params.toString()}`
        );
        console.log("response", response);
        if (response.status >= 200 && response.status < 300) {
          setProperties(response.data?.properties || response.data);
          setTotalItems(response.data?.total || 0);
        } else {
          setProperties([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.log(error);
        setProperties([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [location, propertyType, minPrice, maxPrice, page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <section className="bg-brand-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex-col items-start sm:px-6 lg:px-8">
          <PropertySearchForm />
        </div>
      </section>
      {loading ? (
        <Spinner loading={loading} />
      ) : (
        <section className="px-4 py-6">
          <div className="container-xl lg:container m-auto px-4 py-6">
            <Link
              href="/properties"
              className="flex items-center text-brand-500 hover:underline mb-3"
            >
              <FaArrowAltCircleLeft className="mr-2" /> back to properties
            </Link>
            <h1 className="text-2xl font-bold">Search Results</h1>
            {properties?.length === 0 ? (
              <div>No Search Results found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {properties?.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )}
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default SearchResultsPage;
