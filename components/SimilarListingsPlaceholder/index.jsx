import React from "react";

const SimilarListingsPlaceholder = () => {
  const placeholders = [1, 2, 3];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Similar Listings</h2>
        <span className="text-sm text-blue-600 hover:underline cursor-pointer">See all</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholders.map((id) => (
          <div key={id} className="rounded-lg border border-gray-100 shadow-sm p-4 bg-gray-50">
            <div className="h-28 bg-gray-200 rounded-md mb-3" />
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarListingsPlaceholder;