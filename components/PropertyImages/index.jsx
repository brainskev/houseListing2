import React from "react";
import Image from "next/image";

import { Gallery, Item } from "react-photoswipe-gallery";

const PropertyImages = ({ images }) => {
  return (
    <Gallery>
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-8">
        <div className="container mx-auto px-4">
          {images?.length === 1 ? (
            <Item
              original={images[0]}
              thumbnail={images[0]}
              width="1000"
              height="600"
            >
              {({ ref, open }) => (
                <Image
                  ref={ref}
                  onClick={open}
                  src={images[0]}
                  alt="Property main image"
                  className="object-cover h-[500px] w-full mx-auto rounded-xl shadow-2xl cursor-pointer hover:opacity-95 transition-opacity"
                  width={0}
                  height={0}
                  priority={true}
                  sizes="100vw"
                />
              )}
            </Item>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images?.map((image, index) => (
                <div
                  key={index}
                  className={`${
                    images?.length === 3 && index === 2
                      ? "col-span-2"
                      : images?.length === 1
                      ? "col-span-2"
                      : index === 0 && images?.length > 1
                      ? "md:col-span-2 md:row-span-2"
                      : "col-span-1"
                  }`}
                >
                  <Item
                    original={image}
                    thumbnail={image}
                    width="1000"
                    height="600"
                  >
                    {({ ref, open }) => (
                      <div className="relative group h-full">
                        <Image
                          ref={ref}
                          onClick={open}
                          src={image}
                          alt={`Property image ${index + 1}`}
                          className={`object-cover w-full rounded-xl shadow-xl cursor-pointer hover:opacity-95 transition-opacity ${
                            index === 0 ? "h-full min-h-[500px]" : "h-[245px]"
                          }`}
                          width={0}
                          height={0}
                          priority={index === 0}
                          sizes="100vw"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-60 px-4 py-2 rounded-lg">
                            Click to view fullscreen
                          </span>
                        </div>
                      </div>
                    )}
                  </Item>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Gallery>
  );
};

export default PropertyImages;
