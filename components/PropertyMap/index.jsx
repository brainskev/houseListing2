"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Spinner from "../Spinner";

// Fix Leaflet default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PropertyMap = ({ property }) => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoCodeError, setGeoCodeError] = useState(false);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const address = `${property?.location?.street || ""} ${property?.location?.city || ""} ${property?.location?.state || ""} ${property?.location?.zipcode || ""}`.trim();
        
        if (!address) {
          console.log("No address available");
          setGeoCodeError(true);
          setLoading(false);
          return;
        }

        console.log("Geocoding address:", address);
        
        // Use Nominatim (OpenStreetMap) for free geocoding with proper headers
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          {
            headers: {
              'User-Agent': 'PropertyPulse/1.0'
            }
          }
        );
        
        if (!response.ok) {
          console.error("Geocoding API error:", response.status);
          setGeoCodeError(true);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Geocoding response:", data);
        
        if (data.length === 0) {
          console.log("No geocoding results found for:", address);
          setGeoCodeError(true);
          setLoading(false);
          return;
        }
        
        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        
        console.log("Coordinates found:", { latitude, longitude });
        
        setLat(latitude);
        setLng(longitude);
        setLoading(false);
      } catch (error) {
        console.error("Geocoding error:", error);
        setGeoCodeError(true);
        setLoading(false);
      }
    };
    
    if (property?.location) {
      fetchCoords();
    } else {
      console.log("No property location data");
      setGeoCodeError(true);
      setLoading(false);
    }
  }, [property]);

  if (loading) return <Spinner loading={loading} />;

  // Handle the case where no location data found
  if (geoCodeError || !lat || !lng) {
    return (
      <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-200 p-4 rounded-lg">
        Map unavailable. Unable to geocode the property location.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <strong>{property?.name}</strong>
              <br />
              {property?.location?.street}
              <br />
              {property?.location?.city}, {property?.location?.state}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
