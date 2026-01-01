"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, MapPin, Search, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const defaultProperties = [
  {
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    price: "$2.4M",
    location: "Beverly Hills, CA",
    delay: 0.3,
    className: "left-[5%] top-[15%] hidden lg:block",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
    price: "$1.8M",
    location: "Miami Beach, FL",
    delay: 0.5,
    className: "right-[8%] top-[20%] hidden lg:block",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80",
    price: "$3.2M",
    location: "Manhattan, NY",
    delay: 0.7,
    className: "left-[10%] bottom-[15%] hidden md:block",
  },
  {
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&auto=format&fit=crop&q=80",
    price: "$2.9M",
    location: "San Francisco, CA",
    delay: 0.9,
    className: "right-[12%] bottom-[20%] hidden md:block",
  },
];

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

function FloatingCard({ className, delay = 0, image, price, location }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay, ease: [0.23, 0.86, 0.39, 0.96] }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="relative h-72 w-64 overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-2xl"
      >
        <Image
          src={image}
          alt={location}
          fill
          sizes="(max-width: 768px) 70vw, (max-width: 1280px) 28vw, 320px"
          quality={90}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="mb-1 text-2xl font-bold">{price}</div>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-3 w-3" />
            <span>{location}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PremiumHero({
  onSearch,
  properties = defaultProperties,
  stats = statsDefault,
  eyebrow = "Premium Real Estate Platform",
  headline = "Find Your",
  subHeadline = "Dream Home",
  description = "Discover luxury properties in the most sought-after locations. Your perfect home is just a search away.",
  ctaLabel = "Search Properties",
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query);
  };

  return (
    <section className="relative flex min-h-[65vh] sm:min-h-[50vh] md:min-h-[80vh] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-brand-700 to-brand-700 pb-12 md:pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />

      <div className="absolute inset-0 overflow-hidden">
        {properties.map((property, index) => (
          <FloatingCard key={property.location + index} {...property} />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center text-white">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md md:mb-12"
          >
            <Home className="h-4 w-4 text-white" />
            <span className="text-sm font-medium tracking-wide text-white/90">{eyebrow}</span>
          </motion.div>

          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:mb-8 md:text-7xl lg:text-8xl">
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
            className="mx-auto max-w-2xl px-4"
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
