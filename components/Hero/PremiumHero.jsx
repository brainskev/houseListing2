"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, MapPin, Search, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProperties } from "@/utils/requests";

// Format price to shorthand (1000000 -> 1M, 9000 -> 9K)
const formatPriceShort = (price) => {
  if (!price) return "$0";
  if (price >= 1000000) {
    return "$" + (price / 1000000).toFixed(price % 1000000 !== 0 ? 1 : 0) + "M";
  }
  if (price >= 1000) {
    return "$" + (price / 1000).toFixed(price % 1000 !== 0 ? 1 : 0) + "K";
  }
  return "$" + price;
};

const statsDefault = [
  "10,000+ Properties",
  "500+ Cities",
  "Trusted by 50,000+ Buyers",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.4 + i * 0.18, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function FloatingCard({ className, delay = 0, image, price, location, propertyId, onClick, showInfo = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay, ease: [0.23, 0.86, 0.39, 0.96] }}
      className={cn("absolute cursor-pointer", className)}
      onClick={(e) => {
        e.stopPropagation();
        console.log("Outer motion.div clicked");
        onClick?.();
      }}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative h-[21rem] w-[19rem] overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl cursor-pointer hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Inner motion.div clicked");
          onClick?.();
        }}
      >
        <Image
          src={image}
          alt={location}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 320px, 320px"
          quality={100}
          className="object-cover pointer-events-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
        {showInfo && (
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white pointer-events-none">
            <div className="mb-1 text-2xl font-bold">{price}</div>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3 w-3" />
              <span>{location}</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function PremiumHero({
  onSearch,
  stats = statsDefault,
  eyebrow = "Premium Real Estate Platform",
  headline = "Find Your",
  subHeadline = "Dream Home",
  description = "Discover luxury properties in the most sought-after locations. Your perfect home is just a search away.",
  ctaLabel = "Search Properties",
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log("Fetching properties with cache bust...");
        // Add cache busting to force fresh data and fetch ALL properties (no pagination)
        const response = await fetchProperties({ bustCache: Date.now(), pageSize: 1000 });
        console.log("Raw response:", response);
        
        // Handle both array and object with properties field
        let allProperties = Array.isArray(response) ? response : response?.properties;
        
        if (!allProperties || !Array.isArray(allProperties)) {
          console.warn("No properties array returned or invalid format, response:", response);
          return;
        }

        console.log("Total properties:", allProperties.length);

        if (allProperties.length === 0) {
          console.warn("Properties array is empty - no properties in database");
          return;
        }

        // Filter properties marked for hero display
        const heroProperties = allProperties.filter((prop) => prop.show_in_hero === true);
        console.log("Properties marked for hero (show_in_hero=true):", heroProperties.length, heroProperties.map(p => ({ name: p.name, id: p._id })));
        
        // Determine which properties to use
        let propertiesToUse;
        if (heroProperties.length > 0) {
          console.log("Using hero-marked properties (found", heroProperties.length, ")");
          propertiesToUse = heroProperties;
        } else {
          console.log("No hero properties marked, falling back to most expensive");
          propertiesToUse = allProperties;
        }

        // Filter properties that have at least 2 images and price
        const validProperties = propertiesToUse.filter((prop) => {
          const hasImages =
            prop.images && Array.isArray(prop.images) && prop.images.length >= 2;
          const hasPrice = prop.rates?.price;
          const isValid = hasImages && hasPrice;

          console.log(`Property "${prop.name}":`, {
            _id: prop._id,
            show_in_hero: prop.show_in_hero,
            imageCount: prop.images?.length,
            hasImages,
            price: prop.rates?.price,
            hasPrice,
            isValid,
            WILL_SHOW: isValid ? "✅ YES" : "❌ NO",
          });

          return isValid;
        });

        if (validProperties.length > 0) {
          // Sort by price descending
          const sorted = [...validProperties].sort(
            (a, b) => (b.rates?.price || 0) - (a.rates?.price || 0)
          );

          // Take top 2 properties and create 4 cards (2 images per property)
          const topTwoProperties = sorted.slice(0, 2);
          console.log(
            "Top 2 properties selected:",
            topTwoProperties.map((p) => ({
              name: p.name,
              id: p._id,
              show_in_hero: p.show_in_hero,
            }))
          );

          const topProperties = [];
          const cardPositions = [
            "left-[5%] top-[15%] hidden lg:block",
            "left-[12%] bottom-[15%] hidden md:block", // slight shift toward center
            "right-[8%] top-[15%] hidden lg:block",
            "right-[12%] bottom-[15%] hidden md:block", // slight shift toward center
          ];

          for (let propIndex = 0; propIndex < topTwoProperties.length; propIndex++) {
            const prop = topTwoProperties[propIndex];
            // Reorder so the price card (second card) uses the first image
            let images = Array.isArray(prop.images) ? prop.images.slice(0, 2) : [];
            if (images.length === 2) {
              images = [images[1], images[0]]; // first card gets second image; second card gets first image
            }

            for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
              const image = images[imgIndex];
              const cardIndex = propIndex * 2 + imgIndex;
              const isPriceCard = imgIndex === 1; // Show price/location on the second image card

              const cardData = {
                id: prop._id,
                image,
                price: formatPriceShort(prop.rates.price),
                location: `${prop.location?.city || "Location"}, ${prop.location?.state || ""}`.trim(),
                delay: 0.3 + cardIndex * 0.2,
                showInfo: isPriceCard,
                className: cardPositions[cardIndex],
              };

              topProperties.push(cardData);
            }
          }

          console.log("Setting properties:", topProperties);
          setProperties(topProperties);
        } else {
          console.warn("No valid properties found with at least 2 images and price");
        }
      } catch (error) {
        console.error("Failed to load properties:", error);
      }
    };

    loadProperties();
  }, []);

  const handlePropertyClick = (propertyId) => {
    console.log("Card clicked! Property ID:", propertyId);
    router.push(`/properties/${propertyId}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query);
  };

  return (
    <section className="relative flex min-h-[65vh] sm:min-h-[50vh] md:min-h-[80vh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-700 to-brand-700 pb-12 md:pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden z-10">
        {properties.map((property, index) => (
          <FloatingCard 
            key={`${property.id}-${index}`}
            {...property} 
            propertyId={property.id}
            onClick={() => {
              console.log("FloatingCard onClick triggered for:", property.id);
              handlePropertyClick(property.id);
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 pointer-events-none">
        <div className="mx-auto max-w-4xl text-center text-white">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md md:mb-12 pointer-events-auto"
          >
            <Home className="h-4 w-4 text-white" />
            <span className="text-sm font-medium tracking-wide text-white/90">{eyebrow}</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-5xl md:mb-8 md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-b from-white to-white/85 bg-clip-text text-transparent">{headline}</span>
              <br />
              <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">{subHeadline}</span>
            </h1>
          </motion.div>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
            <p className="mx-auto mb-8 max-w-2xl px-4 text-base font-light leading-relaxed tracking-wide text-white/60 sm:text-lg md:mb-12 md:text-xl">
              {description}
            </p>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl px-4 pointer-events-auto"
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
                <Search className="h-5 w-5 text-white/60" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Enter location, property type..."
                  className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl bg-white text-brand-700 font-semibold shadow-lg shadow-white/25 transition-all duration-300 hover:scale-105 hover:bg-white/90"
              >
                {ctaLabel}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </form>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/60"
          >
            {stats.map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-700 via-transparent to-brand-700/80" />
    </section>
  );
}
