"use client";

import React from "react";
import { useSession } from "next-auth/react";
import InfoBox from "../InfoBox";

const InfoBoxes = () => {
  const { data: session } = useSession();
  const canManageListings = ["admin", "assistant"].includes(session?.user?.role);

  const ownerButton = canManageListings
    ? { text: "List Property", link: "/properties/add", backgroundColor: "bg-brand-600" }
    : session
    ? { text: "Send Enquiry", link: "/dashboard/user/enquiry", backgroundColor: "bg-brand-600" }
    : { text: "List Property", link: "/properties/add", backgroundColor: "bg-brand-600" };

  return (
    <section>
      <div className="container-xl lg:container m-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
          <InfoBox
            heading={"For Buyers"}
            backgroundColor={"bg-white"}
            buttonInfo={{ text: "Browse Properties", link: "/properties", backgroundColor: "bg-brand-600" }}
          >
            Find your dream rental property. Bookmark properties and contact owners.
          </InfoBox>

          <InfoBox
            heading={canManageListings ? "For Property Owners" : "For Owners & Agents"}
            backgroundColor={"bg-white"}
            buttonInfo={ownerButton}
          >
            {canManageListings
              ? "List your properties and reach potential tenants. Rent as an Airbnb or long term."
              : "Listing access is reserved for staff accounts. Send us an enquiry to share your property details."}
          </InfoBox>
        </div>
      </div>
    </section>
  );
};

export default InfoBoxes;