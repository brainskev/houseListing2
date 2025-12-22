"use client";
import React, { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";

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

  const desktopThumbs = useMemo(() => {
    return safeImages
      .map((src, i) => ({ src, i }))
      .filter(({ i }) => i !== activeIndex)
      .slice(0, 4);
  }, [safeImages, activeIndex]);

  return (
    <Gallery>
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_450px] gap-3 md:gap-4">
            {/* Main image */}
            <div
              className="relative w-full h-[50vh] min-h-[320px] rounded-lg overflow-hidden bg-gray-100"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <Item original={safeImages[activeIndex]} thumbnail={safeImages[activeIndex]} width="1600" height="1000">
                {({ ref, open }) => (
                  <Image
                    ref={ref}
                    onClick={open}
                    src={safeImages[activeIndex]}
                    alt={`Property image ${activeIndex + 1}`}
                    fill
                    priority
                    className="object-cover cursor-pointer"
                    sizes="100vw"
                  />
                )}
              </Item>
              {/* Optional arrows for quick browsing on desktop */}
              {total > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white rounded-full p-2 transition"
                    onClick={() => goTo(activeIndex - 1)}
                  >
                    ❮
                  </button>
                  <button
                    aria-label="Next image"
                    className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white rounded-full p-2 transition"
                    onClick={() => goTo(activeIndex + 1)}
                  >
                    ❯
                  </button>
                </>
              )}
              {/* Counter badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2.5 py-0.5 rounded-full text-xs">
                {activeIndex + 1} / {total}
              </div>
            </div>

            {/* Desktop: 2x2 thumbnails beside main */}
            {total > 1 && (
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {desktopThumbs.map(({ src, i }, idx) => {
                  const remaining = total - 1 - desktopThumbs.length;
                  const showOverlay = idx === desktopThumbs.length - 1 && remaining > 0;
                  return (
                    <Item key={src + i} original={src} thumbnail={src} width="1600" height="1000">
                      {({ ref, open }) => (
                        <button
                          ref={ref}
                          type="button"
                          onClick={() => {
                            setActiveIndex(i);
                            open();
                          }}
                          className={`relative rounded-lg overflow-hidden border ${
                            i === activeIndex ? "border-brand-500" : "border-gray-200"
                          }`}
                        >
                          <Image src={src} alt={`Thumbnail ${i + 1}`} fill sizes="300px" className="object-cover" />
                          {showOverlay && (
                            <div className="absolute inset-0 bg-black/35 text-white flex items-center justify-center text-sm font-semibold">
                              +{remaining} more
                            </div>
                          )}
                        </button>
                      )}
                    </Item>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile: horizontal thumbnails scroller beneath main */}
          {total > 1 && (
            <div className="mt-3 md:hidden flex gap-2 overflow-x-auto -mx-1 px-1">
              {safeImages.map((src, i) => (
                <Item key={src + i} original={src} thumbnail={src} width="1600" height="1000">
                  {({ ref, open }) => (
                    <button
                      ref={ref}
                      type="button"
                      onClick={() => {
                        setActiveIndex(i);
                        open();
                      }}
                      className={`relative flex-shrink-0 rounded-md overflow-hidden border ${
                        i === activeIndex ? "border-brand-500 ring-1 ring-brand-300" : "border-gray-200"
                      }`}
                    >
                      <Image src={src} alt={`Thumb ${i + 1}`} width={120} height={80} className="object-cover w-[120px] h-[80px]" />
                    </button>
                  )}
                </Item>
              ))}
            </div>
          )}
        </div>
      </section>
    </Gallery>
  );
};

export default ImageCarousel;