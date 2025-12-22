"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const PropertyAddForm = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
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
      price: "",
      weekly: "",
      monthly: "",
      nightly: "",
    },
    seller_info: {
      name: "",
      email: "",
      phone: "",
    },
    images: [],
  });
  useEffect(() => {
    setMounted(true);
  }, []);
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
  const handleImageChange = (e) => {
    const { files } = e.target;
    const updatedImages = [...fields.images];
    for (const file of files) {
      updatedImages.push(file);
    }
    setFields((prevFields) => ({
      ...prevFields,
      images: updatedImages,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build FormData explicitly from state to preserve Step 1 details
      const formData = new FormData();
      // Core fields
      formData.set("type", fields.type || "");
      formData.set("name", fields.name || "");
      formData.set("description", fields.description || "");
      // Location
      formData.set("location.street", fields.location.street || "");
      formData.set("location.city", fields.location.city || "");
      formData.set("location.state", fields.location.state || "");
      formData.set("location.zipcode", fields.location.zipcode || "");
      // Numbers
      formData.set("beds", String(fields.beds || ""));
      formData.set("baths", String(fields.baths || ""));
      formData.set("square_feet", String(fields.square_feet || ""));
      // Amenities
      (fields.amenities || []).forEach((a) => formData.append("amenities", a));
      // Rates
      formData.set("rates.price", String(fields.rates.price || ""));
      formData.set("rates.weekly", String(fields.rates.weekly || ""));
      formData.set("rates.monthly", String(fields.rates.monthly || ""));
      formData.set("rates.nightly", String(fields.rates.nightly || ""));
      // Seller info
      formData.set("seller_info.name", fields.seller_info.name || "");
      formData.set("seller_info.email", fields.seller_info.email || "");
      formData.set("seller_info.phone", fields.seller_info.phone || "");
      // Images from state (Step 2 input populates this)
      (fields.images || []).forEach((file) => formData.append("images", file));
      
      const response = await fetch("/api/properties", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add property");
      }

      const data = await response.json();
      toast.success("Property added successfully!");
      
      // Redirect to the new property page
      if (data._id) {
        router.push(`/properties/${data._id}`);
      } else {
        router.push("/properties");
      }
    } catch (err) {
      console.error("Error adding property:", err);
      setError(err.message || "Failed to add property. Please try again.");
      toast.error(err.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    mounted && (
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2 className="text-3xl text-center font-semibold mb-6">
          Add Property
        </h2>
        <div className="flex items-center justify-center gap-2 mb-6 text-sm">
          <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 1: Details</span>
          <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Step 2: Images</span>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mb-4 p-4 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-600"></div>
              <p className="text-brand-800 text-sm font-medium">Uploading property and images...</p>
            </div>
          </div>
        )}

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
          <label className="block text-gray-700 font-bold mb-2">
            Rates (Leave blank if not applicable)
          </label>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <label htmlFor="weekly_rate" className="mr-2">
                Listing price
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
                App Monthly
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
        <div className="mb-2 text-xs text-gray-600">The first image will be used as the cover.</div>
        <div className="mb-4">
          <label
            htmlFor="images"
            className="block text-gray-700 font-bold mb-2"
          >
            Images (Select up to 4 images)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            className="border rounded w-full py-2 px-3"
            accept="image/*"
            multiple
            onChange={handleImageChange}
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
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </span>
            ) : (
              "Add Property"
            )}
          </button>
        </div>
        </>
        )}
      </form>
    )
  );
};

export default PropertyAddForm;
