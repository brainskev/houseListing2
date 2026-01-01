import React from 'react'
import Hero, { PremiumHero, MobileHero } from '@/components/Hero'
import InfoBoxes from '@/components/InfoBoxes'
import HomeProperties from "@/components/HomeProperties";
import FeaturedProperties from "@/components/FeaturedProperties";

const HomePage = async () => {
  return (
    <div className="relative isolate bg-slate-50">
      {/* subtle modern backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-mesh" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="space-y-6 md:space-y-10">
        {/* Mobile Hero - shows on small and medium screens (iPad) */}
        <div className="lg:hidden">
          <MobileHero />
        </div>
        
        {/* Premium Hero - shows on large screens and above */}
        <div className="hidden lg:block -mb-2 lg:-mb-4">
          <PremiumHero />
        </div>

        <div className="container mx-auto px-4 -mt-4 md:-mt-8">
          <InfoBoxes />
        </div>

        <div className="container mx-auto px-4">
          <FeaturedProperties />
        </div>

        <div className="container mx-auto px-4 pb-8 md:pb-12">
          <HomeProperties />
        </div>
      </div>
    </div>
  );
};

export default HomePage