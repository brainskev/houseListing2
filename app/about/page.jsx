export const metadata = {
  title: "About Brickly",
  description:
    "Learn about Brickly — your modern real estate hub for listings, advice, and local market insights.",
};

import { FaHome, FaHandshake, FaChartLine, FaFeather } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight">About Brickly</h1>
            <p className="mt-4 text-brand-100 text-lg">
              A stylish, modern hub for discovering homes, connecting with agents, and staying ahead of the market.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-6 -mt-10">
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-8 md:p-10">
          <div className="prose max-w-none">
            <p>
              Brickly is designed to make property discovery and management effortless. We bring together verified listings,
              helpful guidance, and local market insights so buyers, renters, owners, and agents can make confident decisions.
            </p>
          </div>

          {/* Highlights */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-brand-700">
                <FaHome />
                <h2 className="text-base font-semibold text-slate-900">Trusted Listings</h2>
              </div>
              <p className="mt-2 text-sm text-slate-700">Curated properties with rich media and essential details.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-brand-700">
                <FaHandshake />
                <h2 className="text-base font-semibold text-slate-900">Expert Guidance</h2>
              </div>
              <p className="mt-2 text-sm text-slate-700">Direct messaging and enquiry tools for fast responses.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 text-brand-700">
                <FaChartLine />
                <h2 className="text-base font-semibold text-slate-900">Market Insights</h2>
              </div>
              <p className="mt-2 text-sm text-slate-700">Editorial content and trends from our real estate blog.</p>
            </div>
          </div>

          {/* Mission */}
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3 text-brand-700">
              <FaFeather />
              <h2 className="text-lg font-semibold text-slate-900">Our Mission</h2>
            </div>
            <p className="mt-2 text-slate-700">
              To empower people with clear, reliable information and intuitive tools — helping you find the right place and
              connect with the right agents, faster.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
