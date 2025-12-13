"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";

const ImageCarousel = ({ images = [] }) => {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/properties/placeholder.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);
  const total = safeImages.length;

  const goTo = useCallback(
    (nextIndex) => {
      if (total === 0) return;
      const wrapped = (nextIndex + total) % total;
      setActiveIndex(wrapped);
    },
    [total]
  );

  // Basic touch swipe support
  let startX = null;
  const onTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) > 50) {
      goTo(activeIndex + (delta < 0 ? 1 : -1));
    }
    startX = null;
  };

  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-4">
        <div
          className="relative w-full h-[55vh] min-h-[320px] rounded-2xl overflow-hidden bg-gray-800"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={safeImages[activeIndex]}
            alt={`Property image ${activeIndex + 1}`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          {/* Arrows */}
          {total > 1 && (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition"
                onClick={() => goTo(activeIndex - 1)}
              >
                ❮
              </button>
              <button
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition"
                onClick={() => goTo(activeIndex + 1)}
              >
                ❯
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-3 right-4 bg-black/60 px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} / {total}
          </div>
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <>
            {/* Mobile: horizontal scroll, compact thumbs */}
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 md:hidden">
              {safeImages.map((img, idx) => (
                <button
                  key={img + idx}
                  className={`relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                    idx === activeIndex ? "border-blue-400" : "border-transparent hover:border-white/60"
                  }`}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="mt-4 hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {safeImages.map((img, idx) => (
                <button
                  key={img + idx}
                  className={`relative h-20 rounded-lg overflow-hidden border-2 transition ${
                    idx === activeIndex ? "border-blue-400" : "border-transparent hover:border-white/60"
                  }`}
                  onClick={() => goTo(idx)}
                  aria-label={`Go to image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ImageCarousel;