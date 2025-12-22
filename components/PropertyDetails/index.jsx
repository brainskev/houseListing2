import React from "react";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaTimes,
  FaCheck,
  FaMapMarker,
  FaHome,
  FaDollarSign,
  FaCalendar,
} from "react-icons/fa";
import PropertyMap from "../PropertyMap";

const PropertyDetails = ({ property }) => {
    const calculateMonthlyPayment = (price) => {
      // Rough estimate: 4% interest, 30 years, 20% down
      const principal = price * 0.8;
      const monthlyRate = 0.04 / 12;
      const numPayments = 360;
      const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      return Math.round(payment);
    };

  return (
    <main className="space-y-6">
      {/* Header Section - Property Name, Type, Location */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <FaHome className="text-brand-200" />
            <span className="text-brand-100 text-sm font-medium uppercase tracking-wide">{property?.type}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-3">{property?.name}</h1>
          <div className="flex items-start gap-2 text-brand-50">
            <FaMapMarker className="text-xl mt-1 flex-shrink-0" />
            <p className="text-lg">
              {property?.location?.street && `${property.location.street}, `}
              {property?.location?.city}, {property?.location?.state} {property?.location?.zipcode}
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-brand-50 rounded-lg p-5">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaDollarSign />
                <span className="text-sm font-medium uppercase tracking-wide">Listing Price</span>
              </div>
              {property?.rates?.price ? (
                <div>
                  <div className="text-4xl font-bold text-brand-600">
                    ${property.rates.price.toLocaleString()}
                  </div>
                  {property.square_feet && (
                    <div className="text-sm text-gray-500 mt-1">
                      ${Math.round(property.rates.price / property.square_feet).toLocaleString()} per sqft
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-2xl text-gray-400 flex items-center gap-2">
                  <FaTimes /> Not Available
                </div>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-5">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaCalendar />
                <span className="text-sm font-medium uppercase tracking-wide">Estimated Monthly Payment</span>
              </div>
              {property?.rates?.monthly ? (
                <div className="text-4xl font-bold text-green-600">
                  ${property.rates.monthly.toLocaleString()}<span className="text-xl text-gray-500">/mo</span>
                </div>
              ) : property?.rates?.price ? (
                <div>
                  <div className="text-4xl font-bold text-green-600">
                    ${calculateMonthlyPayment(property.rates.price).toLocaleString()}<span className="text-xl text-gray-500">/mo</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Estimated mortgage payment</div>
                </div>
              ) : (
                <div className="text-2xl text-gray-400 flex items-center gap-2">
                  <FaTimes /> Not Available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Stats */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <FaBed className="text-3xl text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{property?.beds}</div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <FaBath className="text-3xl text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{property?.baths}</div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <FaRulerCombined className="text-3xl text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{property?.square_feet?.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Square Feet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-brand-600 rounded"></span>
          Property Description
        </h2>
        <p className="text-gray-700 leading-relaxed text-lg">
          {property?.description || "No description available for this property."}
          </p>
        </div>

      {/* Amenities Section */}
      {property?.amenities && property.amenities.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-600 rounded"></span>
            Amenities & Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3 bg-green-50 p-3 rounded-lg">
                <FaCheck className="text-green-600 flex-shrink-0" />
                <span className="text-gray-800">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller Info Section */}
      {property?.seller_info && (property.seller_info.name || property.seller_info.email || property.seller_info.phone) && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-brand-600 rounded"></span>
            Seller Information
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            {property.seller_info.name && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 w-20">Name:</span>
                <span className="text-gray-900">{property.seller_info.name}</span>
              </div>
            )}
            {property.seller_info.email && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 w-20">Email:</span>
                <a href={`mailto:${property.seller_info.email}`} className="text-brand-600 hover:underline">
                  {property.seller_info.email}
                </a>
              </div>
            )}
            {property.seller_info.phone && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 w-20">Phone:</span>
                <a href={`tel:${property.seller_info.phone}`} className="text-brand-600 hover:underline">
                  {property.seller_info.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/**Map Box code */}
      {/* <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-brand-600 rounded"></span>
          Location
        </h2>
        <PropertyMap property={property} /> 
      </div> */}
    </main>
  );
};

export default PropertyDetails;
