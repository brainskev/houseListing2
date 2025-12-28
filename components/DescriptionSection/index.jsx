import React from "react";

const DescriptionSection = ({ description }) => {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">Home Description</h2>
      <p className="text-gray-700 leading-relaxed text-base">
        {description || "No description available for this property."}
      </p>
    </section>
  );
};

export default DescriptionSection;