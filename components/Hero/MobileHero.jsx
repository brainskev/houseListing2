"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Home, DollarSign } from "lucide-react";

export default function MobileHero() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("All");
  const [priceRange, setPriceRange] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const getPriceRange = (range) => {
    const ranges = {
      "0-300k": { min: 0, max: 300000 },
      "300k-600k": { min: 300000, max: 600000 },
      "600k-1m": { min: 600000, max: 1000000 },
      "1m+": { min: 1000000, max: null },
    };
    return ranges[range] || {};
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Trim and add location if provided
    const cleanLocation = location?.trim();
    if (cleanLocation) {
      params.append("location", cleanLocation);
    }
    
    // Add property type if it's not 'All'
    if (propertyType && propertyType !== "All") {
      params.append("propertyType", propertyType);
    }
    
    // Add price range if selected
    if (priceRange) {
      const { min, max } = getPriceRange(priceRange);
      if (min !== undefined && min !== null) {
        params.append("minPrice", min);
      }
      if (max !== undefined && max !== null) {
        params.append("maxPrice", max);
      }
    }

    const query = params.toString();
    // Always go to search results, even with empty query (shows all properties)
    router.push(`/properties/search-results${query ? `?${query}` : ''}`);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop"
          alt="Luxury home"
          fill
          className="object-cover"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-brand-900/60 to-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center py-8">
        <div className="max-w-lg space-y-4 w-full">
          <h1 className="text-3xl font-bold text-white leading-tight">
            Find Your Dream Home
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Discover the perfect property from our curated collection
          </p>

          {/* Search Card */}
          <div className="relative z-[50000]">
            <Card className="p-4 bg-white/95 backdrop-blur-md shadow-xl border-brand-200/50 mt-6 overflow-visible">
              <form onSubmit={handleSearch} className="space-y-3 relative">
                <div className="relative z-10">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Enter location or city"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 text-sm h-9"
                  />
                </div>

                <div className="relative z-[20000]">
                  <Select 
                    value={propertyType} 
                    onValueChange={setPropertyType}
                    open={openDropdown === 'propertyType'}
                    onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'propertyType' : null)}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="Studio">Studio</SelectItem>
                      <SelectItem value="Condo">Condo</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Cabin Or Cottage">Cabin or Cottage</SelectItem>
                      <SelectItem value="Loft">Loft</SelectItem>
                      <SelectItem value="Room">Room</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative z-[15000]">
                  <Select 
                    value={priceRange} 
                    onValueChange={setPriceRange}
                    open={openDropdown === 'priceRange'}
                    onOpenChange={(isOpen) => setOpenDropdown(isOpen ? 'priceRange' : null)}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-300k">$0 - $300k</SelectItem>
                      <SelectItem value="300k-600k">$300k - $600k</SelectItem>
                      <SelectItem value="600k-1m">$600k - $1M</SelectItem>
                      <SelectItem value="1m+">$1M+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative z-0">
                  <Button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-lg shadow-brand-600/30"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3 mt-8 pt-4 relative z-0">
            <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="flex items-center gap-3">
                <Home className="w-6 h-6 text-brand-300" />
                <div>
                  <div className="text-xl font-bold">15,000+</div>
                  <div className="text-xs text-white/80">Properties Listed</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-brand-300" />
                <div>
                  <div className="text-xl font-bold">$2.5B+</div>
                  <div className="text-xs text-white/80">Property Value</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-brand-300" />
                <div>
                  <div className="text-xl font-bold">200+</div>
                  <div className="text-xs text-white/80">Cities Covered</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
