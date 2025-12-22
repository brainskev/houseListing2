import React, { useState, useMemo } from "react";
import Image from "next/image";

import { Gallery, Item } from "react-photoswipe-gallery";

const PropertyImages = ({ images }) => {
  const imgs = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);
  const [selected, setSelected] = useState(0);
  // Prepare desktop thumbnails (show up to 4 excluding selected)
  const desktopThumbs = useMemo(() => {
    return imgs
      .map((src, i) => ({ src, i }))
      .filter(({ i }) => i !== selected)
      .slice(0, 4);
  }, [imgs, selected]);

  if (!imgs.length) return null;

  return (
    <Gallery>
      <section className="py-6">
        <div className="container mx-auto px-4">
          {/* Desktop: main + 2x2 thumbs grid. Mobile: main + horizontal thumbs */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-3 md:gap-4">
            {/* Main image */}
            <div className="relative">
              <Item original={imgs[selected]} thumbnail={imgs[selected]} width="1600" height="1000">
                {({ ref, open }) => (
                  <Image
                    ref={ref}
                    onClick={open}
                    src={imgs[selected]}
                    alt={`Property image ${selected + 1}`}
                    className="w-full h-[48vh] md:h-[520px] object-cover rounded-lg cursor-pointer"
                    width={0}
                    height={0}
                    priority
                    sizes="(max-width:768px) 100vw, 70vw"
                  />
                )}
              </Item>

              {/* Mobile thumbnails: horizontal scroller */}
              {imgs.length > 1 && (
                <div className="mt-3 md:hidden flex gap-2 overflow-x-auto -mx-1 px-1">
                  {imgs.map((src, i) => (
                    <Item key={src + i} original={src} thumbnail={src} width="1600" height="1000">
                      {({ ref, open }) => (
                        <button
                          ref={ref}
                          type="button"
                          onClick={() => {
                            setSelected(i);
                            open();
                          }}
                          className={`relative flex-shrink-0 rounded-md overflow-hidden border ${
                            i === selected ? "border-brand-500 ring-1 ring-brand-300" : "border-gray-200"
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

            {/* Desktop thumbnails: 2x2 grid next to main */}
            {imgs.length > 1 && (
              <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2">
                {desktopThumbs.map(({ src, i }, idx) => {
                  const remaining = imgs.length - 1 - desktopThumbs.length;
                  const showOverlay = idx === desktopThumbs.length - 1 && remaining > 0;
                  return (
                    <Item key={src + i} original={src} thumbnail={src} width="1600" height="1000">
                      {({ ref, open }) => (
                        <button
                          ref={ref}
                          type="button"
                          onClick={() => {
                            setSelected(i);
                            open();
                          }}
                          className={`relative rounded-lg overflow-hidden border ${
                            i === selected ? "border-brand-500" : "border-gray-200"
                          }`}
                        >
                          <Image src={src} alt={`Thumb ${i + 1}`} width={300} height={200} className="object-cover w-full h-[120px]" />
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
        </div>
      </section>
    </Gallery>
  );
};

export default PropertyImages;
