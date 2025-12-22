import Link from "next/link";
import React from "react";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarker,
  FaMoneyBill,
} from "react-icons/fa";
import Image from "next/image";

const FeaturedPropertyCard = ({ property }) => {
  const getRatesDisplay = () => {
    const { rates } = property;
    if (rates.monthly) {
      return `${rates.monthly.toLocaleString()}/mo`;
    } else if (rates.weekly) {
      return `${rates.weekly.toLocaleString()}/wk`;
    } else if (rates.nightly) {
      return `${rates.nightly.toLocaleString()}/ng`;
    }
  };

  return (
    <div className="group bg-white/80 backdrop-blur rounded-2xl border border-slate-200/70 shadow-soft relative flex flex-col md:flex-row overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-slate-300">
      <div className="relative w-full md:w-2/5">
        <Image
          src={property.images[0]}
          alt=""
          sizes="100vw"
          width={0}
          height={0}
          className="object-cover w-full h-full max-h-[320px] md:max-h-none transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent" />

        <div className="absolute top-4 left-4 rounded-xl bg-white/90 px-4 py-2 text-slate-900 font-semibold shadow-sm border border-white/60">
          ${getRatesDisplay()}
        </div>
      </div>

      <div className="p-6 md:p-7 flex-1">
        <h3 className="card-title">{property.name}</h3>
        <div className="text-slate-600 mb-4 text-sm font-medium">
          {property.type}
        </div>

        <div className="flex justify-center md:justify-start gap-4 text-slate-600 mb-4">
          <p>
            <FaBed className="inline mr-2 text-brand-700" /> {property?.beds}{" "}
            <span className="md:hidden lg:inline">Beds</span>
          </p>
          <p>
            <FaBath className="inline mr-2 text-brand-700" /> {property?.baths}{" "}
            <span className="md:hidden lg:inline">Baths</span>
          </p>
          <p>
            <FaRulerCombined className="inline mr-2 text-brand-700" />
            {property?.square_feet}{" "}
            <span className="md:hidden lg:inline">sqft</span>
          </p>
        </div>

        <div className="flex justify-center md:justify-start gap-4 text-emerald-900 text-sm mb-4">
          {property.rates.nightly && (
            <p>
              <FaMoneyBill className="inline mr-2" /> Nightly
            </p>
          )}
          {property.rates.weekly && (
            <p>
              <FaMoneyBill className="inline mr-2" /> Weekly
            </p>
          )}
          {property.rates.monthly && (
            <p>
              <FaMoneyBill className="inline mr-2" /> Monthly
            </p>
          )}
        </div>

        <div className="border border-slate-200/70 mb-5" />

        <div className="flex flex-col lg:flex-row justify-between gap-3">
          <div className="flex align-middle gap-2">
            <FaMapMarker className="text-lg text-orange-700" />
            <span className="text-slate-700 font-medium">
              {property?.location?.city} {property?.location?.state}
            </span>
          </div>

          <Link
            href={`/properties/${property._id}`}
            className="inline-flex items-center justify-center h-[40px] rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedPropertyCard;
