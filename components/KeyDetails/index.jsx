import React from "react";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaHome,
  FaRegCalendarAlt,
} from "react-icons/fa";

const KeyDetails = ({
  beds,
  baths,
  squareFeet,
  lotSize,
  yearBuilt,
  propertyType,
}) => {
  const items = [
    { label: "Beds", value: beds ?? "—", icon: <FaBed /> },
    { label: "Baths", value: baths ?? "—", icon: <FaBath /> },
    { label: "Square Feet", value: squareFeet ? squareFeet.toLocaleString() : "—", icon: <FaRulerCombined /> },
    { label: "Lot Size", value: lotSize ?? "—", icon: <FaHome /> },
    { label: "Year Built", value: yearBuilt ?? "—", icon: <FaRegCalendarAlt /> },
    { label: "Property Type", value: propertyType ?? "—", icon: <FaHome /> },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Key Details</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4 sm:px-6 py-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-3">
            <div className="text-blue-600 text-lg flex-shrink-0">{item.icon}</div>
            <div>
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-base font-semibold text-gray-900">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyDetails;