"use client";
import { fetchProperty } from "@/utils/requests";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
const PropertyEditForm = () => {
  const { id } = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    type: "",
    name: "",
    description: "",
    location: {
      street: "",
      city: "",
      state: "",
      zipcode: "",
    },
    beds: "",
    baths: "",
    square_feet: "",
    amenities: [],
    rates: {
      weekly: "",
      monthly: "",
      nightly: "",
      price: "",
    },
    seller_info: {
      name: "",
      email: "",
      phone: "",
    },
    show_in_hero: false,
  });
  const [step, setStep] = useState(1);
  const [existingImages, setExistingImages] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  useEffect(() => {
    setMounted(true);
    const fetchPropertyData = async () => {
      try {
        const propertyData = await fetchProperty(id);
        //Check PropertyData for null if it is put empty string
        let merged = null;
        if (propertyData) {
          // Normalize rates object: replace null/undefined with empty string
          const incomingRates = propertyData.rates || {};
          const normalizedRates = { ...incomingRates };
          for (const key of ["price", "monthly", "weekly", "nightly"]) {
            if (normalizedRates[key] === null || normalizedRates[key] === undefined) {
              normalizedRates[key] = "";
            }
          }

          merged = {
            ...fields,
            ...propertyData,
            location: {
              ...fields.location,
              ...(propertyData.location || {}),
            },
            rates: {
              ...fields.rates,
              ...normalizedRates,
            },
            seller_info: {
              ...fields.seller_info,
              ...(propertyData.seller_info || {}),
            },
            amenities: Array.isArray(propertyData.amenities)
              ? propertyData.amenities
              : fields.amenities,
          };
        }
        if (merged) {
          setFields(merged);
          setExistingImages(Array.isArray(propertyData.images) ? propertyData.images : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [outerKey, innerKey] = name.split(".");
      setFields((prevFields) => ({
        ...prevFields,
        [outerKey]: {
          ...prevFields[outerKey],
          [innerKey]: value,
        },
      }));
    } else {
      setFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    }
  };
  const handleAmenitiesChange = (e) => {
    const { value, checked } = e.target;
    //clone current array
    const updatedAmenities = [...fields.amenities];
    if (checked) {
      //if checked true add value to the array
      updatedAmenities.push(value);
    } else {
      //if unchecked remove value to the array

      const index = updatedAmenities.indexOf(value);
      if (index !== -1) {
        updatedAmenities.splice(index, 1);
      }
    }
    //update state with updated array
    setFields((prevFields) => ({
      ...prevFields,
      amenities: updatedAmenities,
    }));
  };

  const removeExistingImage = (index) => {
    setExistingImages((imgs) => imgs.filter((_, i) => i !== index));
  };

  const moveExistingImageUp = (index) => {
    if (index === 0) return;
    setExistingImages((imgs) => {
      const copy = [...imgs];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const moveExistingImageDown = (index) => {
    setExistingImages((imgs) => {
      if (index >= imgs.length - 1) return imgs;
      const copy = [...imgs];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    setExistingImages((imgs) => {
      if (dragIndex === null || dragIndex === index) return imgs;
      const copy = [...imgs];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(index, 0, moved);
      return copy;
    });
    setDragIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      // Build FormData from current step's DOM, then ensure Step 1 fields are included from state
      const formData = new FormData(e.target);
      // Append core fields from Step 1 in case they're not mounted in DOM
      formData.set("type", fields.type || "");
      formData.set("name", fields.name || "");
      formData.set("description", fields.description || "");
      formData.set("location.street", fields.location.street || "");
      formData.set("location.city", fields.location.city || "");
      formData.set("location.state", fields.location.state || "");
      formData.set("location.zipcode", fields.location.zipcode || "");
      formData.set("beds", String(fields.beds || ""));
      formData.set("baths", String(fields.baths || ""));
      formData.set("square_feet", String(fields.square_feet || ""));
      // Amenities: clear any existing and append current array
      formData.delete("amenities");
      (fields.amenities || []).forEach((a) => formData.append("amenities", a));
      // Rates
      formData.set("rates.price", String(fields.rates.price || ""));
      formData.set("rates.monthly", String(fields.rates.monthly || ""));
      formData.set("rates.weekly", String(fields.rates.weekly || ""));
      formData.set("rates.nightly", String(fields.rates.nightly || ""));
      // Seller info
      formData.set("seller_info.name", fields.seller_info.name || "");
      formData.set("seller_info.email", fields.seller_info.email || "");
      formData.set("seller_info.phone", fields.seller_info.phone || "");
      // Show in hero
      formData.set("show_in_hero", String(fields.show_in_hero || false));
      // Preserve ordered existing images
      for (const url of (existingImages || [])) {
        formData.append("existing_images", url);
      }

      const response = await axios.put(`/api/properties/${id}`, formData);

      if (response.status === 200) {
        console.log("response", response);
        toast.success("Property Updated Successfully");
        router.push(`/properties/${id}`);
      } else if (response.status === 401 || response.status === 403) {
        toast.error("Permission denied");
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };
  return (
    mounted &&
    !loading && (
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl text-center font-semibold mb-6">
          Edit Property
        </h2>
        {saving && (
          <div className="mb-4 p-4 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
              <p className="text-brand-800 text-sm font-medium">Updating property and images...</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mb-6 text-sm">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 1: Details</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 2: Images</span>
        </div>
        {step === 1 && (
        <>
        <div className="mb-4">
          <label htmlFor="type" className="block text-gray-700 font-bold mb-2">
            Property Type
          </label>
          <select
            id="type"
            name="type"
            className="border rounded w-full py-2 px-3"
            required=""
            onChange={handleChange}
            value={fields.type}
          >
            <option value="Apartment">Apartment</option>
            <option value="Condo">Condo</option>
            <option value="House">House</option>
            <option value="Cabin Or Cottage">Cabin or Cottage</option>
            <option value="Room">Room</option>
            <option value="Studio">Studio</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Listing Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="eg. Beautiful Apartment In Miami"
            required=""
            onChange={handleChange}
            value={fields.name}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-bold mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="border rounded w-full py-2 px-3"
            rows={4}
            placeholder="Add an optional description of your property"
            onChange={handleChange}
            value={fields.description}
          />
        </div>
        <div className="mb-4 bg-brand-50 p-4">
          <label className="block text-gray-700 font-bold mb-2">Location</label>
          <input
            type="text"
            id="street"
            name="location.street"
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="Street"
            onChange={handleChange}
            value={fields.location.street}
          />
          <input
            type="text"
            id="city"
            name="location.city"
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="City"
            required=""
            onChange={handleChange}
            value={fields.location.city}
          />
          <input
            type="text"
            id="state"
            name="location.state"
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="State"
            required=""
            onChange={handleChange}
            value={fields.location.state}
          />
          <input
            type="text"
            id="zipcode"
            name="location.zipcode"
            className="border rounded w-full py-2 px-3 mb-2"
            placeholder="Zipcode"
            onChange={handleChange}
            value={fields.location.zipcode}
          />
        </div>
        <div className="mb-4 flex flex-wrap">
          <div className="w-full sm:w-1/3 pr-2">
            <label
              htmlFor="beds"
              className="block text-gray-700 font-bold mb-2"
            >
              Beds
            </label>
            <input
              type="number"
              id="beds"
              name="beds"
              className="border rounded w-full py-2 px-3"
              required=""
              onChange={handleChange}
              value={fields.beds}
            />
          </div>
          <div className="w-full sm:w-1/3 px-2">
            <label
              htmlFor="baths"
              className="block text-gray-700 font-bold mb-2"
            >
              Baths
            </label>
            <input
              type="number"
              id="baths"
              name="baths"
              className="border rounded w-full py-2 px-3"
              required=""
              onChange={handleChange}
              value={fields.baths}
            />
          </div>
          <div className="w-full sm:w-1/3 pl-2">
            <label
              htmlFor="square_feet"
              className="block text-gray-700 font-bold mb-2"
            >
              Square Feet
            </label>
            <input
              type="number"
              id="square_feet"
              name="square_feet"
              className="border rounded w-full py-2 px-3"
              required=""
              onChange={handleChange}
              value={fields.square_feet}
            />
          </div>
        </div>
        <div className="mb-4 bg-brand-50 p-4">
          <label className="block text-gray-700 font-bold mb-2">
            Rates (Leave blank if not applicable)
          </label>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <label htmlFor="nightly_rate" className="mr-2">
                Listing Price
              </label>
              <input
                type="number"
                id="price"
                name="rates.price"
                className="border rounded w-full py-2 px-3"
                value={fields.rates.price}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="monthly_rate" className="mr-2">
                Monthly
              </label>
              <input
                type="number"
                id="monthly_rate"
                name="rates.monthly"
                className="border rounded w-full py-2 px-3"
                value={fields.rates.monthly}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div>
              <input
                type="checkbox"
                id="amenity_wifi"
                name="amenities"
                defaultValue="Wifi"
                className="mr-2"
                checked={fields.amenities.includes("Wifi")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_wifi">Wifi</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_kitchen"
                name="amenities"
                defaultValue="Full Kitchen"
                className="mr-2"
                checked={fields.amenities.includes("Full Kitchen")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_kitchen">Full kitchen</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_washer_dryer"
                name="amenities"
                defaultValue="Washer & Dryer"
                className="mr-2"
                checked={fields.amenities.includes("Washer & Dryer")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_washer_dryer">Washer &amp; Dryer</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_free_parking"
                name="amenities"
                defaultValue="Free Parking"
                className="mr-2"
                checked={fields.amenities.includes("Free Parking")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_free_parking">Free Parking</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_pool"
                name="amenities"
                defaultValue="Swimming Pool"
                className="mr-2"
                checked={fields.amenities.includes("Swimming Pool")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_pool">Swimming Pool</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_hot_tub"
                name="amenities"
                defaultValue="Hot Tub"
                className="mr-2"
                checked={fields.amenities.includes("Hot Tub")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_hot_tub">Hot Tub</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_24_7_security"
                name="amenities"
                defaultValue="24/7 Security"
                className="mr-2"
                checked={fields.amenities.includes("24/7 Security")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_24_7_security">24/7 Security</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_wheelchair_accessible"
                name="amenities"
                defaultValue="Wheelchair Accessible"
                className="mr-2"
                checked={fields.amenities.includes("Wheelchair Accessible")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_wheelchair_accessible">
                Wheelchair Accessible
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_elevator_access"
                name="amenities"
                defaultValue="Elevator Access"
                className="mr-2"
                checked={fields.amenities.includes("Elevator Access")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_elevator_access">Elevator Access</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_dishwasher"
                name="amenities"
                defaultValue="Dishwasher"
                className="mr-2"
                checked={fields.amenities.includes("Dishwasher")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_dishwasher">Dishwasher</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_gym_fitness_center"
                name="amenities"
                defaultValue="Gym/Fitness Center"
                className="mr-2"
                checked={fields.amenities.includes("Gym/Fitness Center")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_gym_fitness_center">
                Gym/Fitness Center
              </label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_air_conditioning"
                name="amenities"
                defaultValue="Air Conditioning"
                className="mr-2"
                checked={fields.amenities.includes("Air Conditioning")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_air_conditioning">Air Conditioning</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_balcony_patio"
                name="amenities"
                defaultValue="Balcony/Patio"
                className="mr-2"
                checked={fields.amenities.includes("Balcony/Patio")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_balcony_patio">Balcony/Patio</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_smart_tv"
                name="amenities"
                defaultValue="Smart TV"
                className="mr-2"
                checked={fields.amenities.includes("Smart TV")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_smart_tv">Smart TV</label>
            </div>
            <div>
              <input
                type="checkbox"
                id="amenity_coffee_maker"
                name="amenities"
                defaultValue="Coffee Maker"
                className="mr-2"
                checked={fields.amenities.includes("Coffee Maker")}
                onChange={handleAmenitiesChange}
              />
              <label htmlFor="amenity_coffee_maker">Coffee Maker</label>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label
            htmlFor="seller_name"
            className="block text-gray-700 font-bold mb-2"
          >
            Seller Name
          </label>
          <input
            type="text"
            id="seller_name"
            name="seller_info.name"
            className="border rounded w-full py-2 px-3"
            placeholder="Name"
            value={fields.seller_info.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="seller_email"
            className="block text-gray-700 font-bold mb-2"
          >
            Seller Email
          </label>
          <input
            type="email"
            id="seller_email"
            name="seller_info.email"
            className="border rounded w-full py-2 px-3"
            placeholder="Email address"
            required=""
            value={fields.seller_info.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="seller_phone"
            className="block text-gray-700 font-bold mb-2"
          >
            Seller Phone
          </label>
          <input
            type="tel"
            id="seller_phone"
            name="seller_info.phone"
            className="border rounded w-full py-2 px-3"
            placeholder="Phone"
            value={fields.seller_info.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4 bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="show_in_hero"
              checked={fields.show_in_hero}
              onChange={(e) => setFields({ ...fields, show_in_hero: e.target.checked })}
              className="w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            <div>
              <span className="text-gray-800 font-bold">Display in Premium Hero Section</span>
              <p className="text-xs text-gray-600 mt-1">Show this property in the hero banner on the homepage (requires at least 2 images)</p>
            </div>
          </label>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
          >
            Next
          </button>
        </div>
        </>
        )}

        {step === 2 && (
        <>
        <div className="mb-4">
          <label
            htmlFor="images"
            className="block text-gray-700 font-bold mb-2"
          >
            Images (Select up to 4 images)
          </label>
          {/* Existing Images Gallery with remove/reorder */}
          {existingImages === null && (
            <div className="mb-4 flex items-center justify-center py-10 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                Loading images...
              </div>
            </div>
          )}
          {existingImages && existingImages.length > 0 && (
            <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {existingImages.map((img, idx) => (
                <div
                  key={img + idx}
                  className={`relative border rounded-md p-2 flex flex-col items-center gap-2 ${dragIndex === idx ? 'opacity-60' : ''} ${idx === 0 ? 'ring-2 ring-brand-500' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                >
                  <Image src={img} alt={`Image ${idx + 1}`} width={300} height={112} className="w-full h-28 object-cover rounded" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 inline-block px-2 py-1 text-[10px] font-semibold rounded bg-brand-600 text-white">
                      Primary
                    </span>
                  )}
                  <div className="flex gap-2">
                    <button type="button" className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200" onClick={() => removeExistingImage(idx)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {existingImages && existingImages.length === 0 && (
            <div className="mb-4 text-sm text-gray-600">No images yet. Use the picker below to add images.</div>
          )}
          <input
            type="file"
            id="images"
            name="images"
            className="border rounded w-full py-2 px-3"
            accept="image/*"
            multiple
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
          >
            Back
          </button>
          <button
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Update Property
          </button>
        </div>
        </>
        )}
      </form>
    )
  );
};

export default PropertyEditForm;
