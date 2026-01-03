"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaStar, FaQuoteLeft } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data); // Show all approved testimonials
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section id="testimonials" className="py-10 md:py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <p className="text-center text-slate-500">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return (
      <section id="testimonials" className="py-10 md:py-16 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200/70 bg-white px-6 py-10 text-center shadow-soft">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Be the first to share
            </h2>
            <p className="max-w-2xl text-slate-600">
              Tell us about your experience so we can keep improving and help others feel confident choosing us.
            </p>
            <Link
              href="/testimonials"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift"
            >
              Share your experience
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-10 md:py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <motion.h2
            custom={0}
            variants={fadeInUp}
            className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl"
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            custom={1}
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-slate-600"
          >
            Don&apos;t just take our word for it. Here&apos;s what our satisfied clients
            have to say about their experience.
          </motion.p>
        </motion.div>

        {/* Swiper Carousel */}
        <div className="relative px-4 sm:px-8">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: ".testimonial-swiper-button-next",
              prevEl: ".testimonial-swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="!pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial._id}>
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift h-full">
                  {/* Quote Icon */}
                  <div className="absolute right-4 top-4 text-brand-100 opacity-50">
                    <FaQuoteLeft className="h-8 w-8" />
                  </div>

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="h-4 w-4 text-amber-400" />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="mb-6 text-sm leading-relaxed text-slate-700 md:text-base">
                    &quot;{testimonial.message}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-lg font-bold text-white shadow-sm">
                      {testimonial.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-slate-500">{testimonial.role}</p>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-500/0 via-transparent to-brand-600/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Arrows */}
          <button className="testimonial-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-brand-50 hover:shadow-xl disabled:opacity-30">
            <svg className="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="testimonial-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:bg-brand-50 hover:shadow-xl disabled:opacity-30">
            <svg className="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-soft ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-lift"
          >
            Share your own experience
          </Link>
        </div>
      </div>
    </section>
  );
}
