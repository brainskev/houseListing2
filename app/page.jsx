import React from 'react'
import Hero from '@/components/Hero'
import InfoBoxes from '@/components/InfoBoxes'
import HomeProperties from "@/components/HomeProperties";
import FeaturedProperties from "@/components/FeaturedProperties";
import TestimonialsSection from "@/components/TestimonialsSection";

const HomePage = async () => {
  return (
    <div className="relative isolate bg-slate-50">
      {/* subtle modern backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-white/80 to-transparent" />

      <div>
        {/* Hero - Mobile Hero displayed on all screens */}
        <Hero />

        <div className="container mx-auto px-4 mt-8 md:mt-12 lg:mt-16 space-y-6 md:space-y-10">
          <InfoBoxes />

          <FeaturedProperties />

          <div className="pb-8 md:pb-12">
            <HomeProperties />
          </div>

          <TestimonialsSection />
        </div>
      </div>
    </div>
  );
};

export default HomePage