import React from 'react'
import { fetchProperties } from '@/utils/requests'
import PropertyCard from '../PropertyCard'
import Link from 'next/link'

const HomeProperties = async () => {
  let data = null

  try {
    data = await fetchProperties()
  } catch (error) {
    console.error('Error fetching properties:', error)
  }

  // Safely handle missing or malformed data
  const allProperties = Array.isArray(data?.properties) ? data.properties : []

  const recentProperties = [...allProperties]
    .sort((a, b) => {
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate; // newest first
    })
    .slice(0, 6)

  return (
    <>
      <section className="py-10 md:py-12">
        <div className="mx-auto">
          <div className="mb-8 text-center">
            <h2 className="h3 bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 bg-clip-text text-transparent">
              Recent Properties
            </h2>
            <p className="mt-2 body-sm">
              Explore what is new on the market.
            </p>
          </div>

          {recentProperties.length === 0 ? (
            <p className="text-center text-base md:text-lg font-semibold text-slate-700">
              No Recent Properties
            </p>
          ) : (
            <div className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-sm p-4 md:p-6 shadow-soft">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProperties.map((property) => (
                  <PropertyCard key={property?._id} property={property} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="m-auto max-w-lg mt-8 mb-6 px-0 md:my-10">
        <Link
          href="/properties"
          className="group inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-center text-sm md:text-base font-semibold text-white shadow-soft transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          View All Properties
          <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </section>
    </>
  );
}

export default HomeProperties