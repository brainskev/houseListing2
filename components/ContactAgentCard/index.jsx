import React from "react";

const ContactAgentCard = ({ children }) => {
  return (
    <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
        <p className="text-sm text-gray-600 mt-1">Message us to Ask a question, or request more details.</p>
      </div>
      {children}
    </aside>
  );
};

export default ContactAgentCard;