import React from "react";

const MapPlaceholder = () => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">Map</h2>
        <span className="text-sm text-gray-500">(Map integration placeholder)</span>
      </div>
      <div className="w-full h-64 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
        Map will appear here
      </div>
    </section>
  );
};

export default MapPlaceholder;