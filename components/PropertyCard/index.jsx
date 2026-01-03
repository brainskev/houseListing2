import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {FaBed,FaBath,FaRulerCombined,FaMapMarker,FaMoneyBill} from "react-icons/fa"
import BookmarkButton from '@/components/BookmarkButton'
import ShareButton from '@/components/ShareButton'

const PropertyCard = ({property}) => {
  const getRatesDisplay = () => { 
    const {rates}=property;
    if(rates.price){
      return `$${rates.price.toLocaleString()}`
    }else if(rates.monthly){
      return `$${rates.monthly.toLocaleString()}/mo`
    }else if(rates.weekly){
      return `$${rates.weekly.toLocaleString()}/wk`
    }else if(rates.nightly){
      return `$${rates.nightly.toLocaleString()}/night`
    }
   }

  return (
    <Link href={`/properties/${property?._id}`} className="group block h-full">
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-soft overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1 hover:shadow-lift hover:border-slate-300">
        {/* Image Section */}
        <div className="relative h-64 sm:h-56 md:h-52 w-full">
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/0 to-slate-900/0" />

          {property.is_featured && (
            <span className="absolute top-3 left-3 bg-white/90 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-white/60">
              Featured
            </span>
          )}

          <div className="absolute top-3 right-3 rounded-xl bg-slate-900/85 text-white px-3 py-2 text-sm font-semibold shadow-sm backdrop-blur border border-white/10">
            {getRatesDisplay()}
          </div>

          <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 text-slate-900 px-3 py-1 text-xs font-semibold border border-white/60">
            {property?.type}
          </div>

          <div className="absolute bottom-3 right-3 flex gap-2">
            <ShareButton property={property} className="px-2 py-1 text-xs" />
            <BookmarkButton property={property} className="px-2 py-1 text-xs" />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
              {property?.name}
            </h3>

            <div className="flex items-center text-slate-600 mb-3">
              <FaMapMarker className="mr-2 text-orange-600 flex-shrink-0 text-xs sm:text-sm" />
              <span className="text-xs sm:text-sm">
                {property?.location?.city}, {property?.location?.state}
              </span>
            </div>

            <div className="flex items-center justify-start space-x-3 sm:space-x-4 text-brand-700 mb-3">
              <div className="flex items-center">
                <FaBed className="mr-1 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm font-medium">{property?.beds}</span>
              </div>
              <div className="flex items-center">
                <FaBath className="mr-1 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm font-medium">{property?.baths}</span>
              </div>
              <div className="flex items-center">
                <FaRulerCombined className="mr-1 text-xs sm:text-sm" />
                <span className="text-xs sm:text-sm font-medium">{property?.square_feet} sqft</span>
              </div>
            </div>

            {property.rates.monthly && property.rates.price && (
              <div className="muted">
                <FaMoneyBill className="inline mr-1" />
                ${property.rates.monthly.toLocaleString()}/mo
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PropertyCard