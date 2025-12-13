import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {FaBed,FaBath,FaRulerCombined,FaMapMarker,FaMoneyBill} from "react-icons/fa"

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
    <Link href={`/properties/${property?._id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full cursor-pointer transform hover:-translate-y-1">
        {/* Image Section with Overlay Badge */}
        <div className="relative h-48 w-full">
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {property.is_featured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              Featured
            </span>
          )}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-lg font-bold shadow-md">
            {getRatesDisplay()}
          </div>
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            {property?.type}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          {/* Property Name */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {property?.name}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <FaMapMarker className="mr-2 text-orange-600 flex-shrink-0" />
              <span className="text-sm">
                {property?.location?.city}, {property?.location?.state}
              </span>
            </div>

            {/* Property Stats */}
            <div className="flex items-center justify-start space-x-4 text-blue-600 mb-3">
              <div className="flex items-center">
                <FaBed className="mr-1" />
                <span className="text-sm font-medium">{property?.beds}</span>
              </div>
              <div className="flex items-center">
                <FaBath className="mr-1" />
                <span className="text-sm font-medium">{property?.baths}</span>
              </div>
              <div className="flex items-center">
                <FaRulerCombined className="mr-1" />
                <span className="text-sm font-medium">{property?.square_feet} sqft</span>
              </div>
            </div>

            {/* Monthly Rate (if different from main price) */}
            {property.rates.monthly && property.rates.price && (
              <div className="text-sm text-gray-500 mb-3">
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