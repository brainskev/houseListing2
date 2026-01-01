import connectDB from "@/config/db";
import Property from "@/models/Property";
export const dynamic = "force-dynamic";

// State name to abbreviation mapping
const stateMap = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};

// Helper to normalize location search terms
const normalizeLocationSearch = (searchTerm) => {
  const normalized = searchTerm.toLowerCase().trim();
  const patterns = [];

  // Add original search term
  patterns.push(searchTerm.trim());

  // Check if it's a state name and add abbreviation
  if (stateMap[normalized]) {
    patterns.push(stateMap[normalized]);
  }

  // Check if it's a state abbreviation and add full name
  const stateAbbrev = normalized.toUpperCase();
  const stateName = Object.keys(stateMap).find(key => stateMap[key] === stateAbbrev);
  if (stateName) {
    patterns.push(stateName);
  }

  // Handle spaces: "fort worth" <-> "fortworth"
  if (searchTerm.includes(' ')) {
    patterns.push(searchTerm.replace(/\s+/g, ''));
  } else if (searchTerm.length > 3) {
    // Try to add space variations for common patterns
    // This will match "fortworth" to documents containing "fort" or "worth"
    const withSpaces = searchTerm.replace(/([a-z])([A-Z])/g, '$1 $2');
    if (withSpaces !== searchTerm) {
      patterns.push(withSpaces);
    }
  }

  return patterns;
};

// GET /api/properties/search
export const GET = async (request) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const propertyType = searchParams.get("propertyType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Build query object - start with empty query to match all properties
    let query = {};

    // Add location filter only if location is provided and not empty
    if (location && location.trim()) {
      const searchPatterns = normalizeLocationSearch(location);
      const orConditions = [];

      // Create regex patterns for each normalized search term
      searchPatterns.forEach(pattern => {
        const regex = new RegExp(pattern, "i");
        orConditions.push(
          { name: regex },
          { description: regex },
          { "location.street": regex },
          { "location.city": regex },
          { "location.state": regex },
          { "location.zipcode": regex }
        );
      });

      // Also split the original search into words and match any of them
      const words = location.trim().split(/\s+/);
      if (words.length > 1) {
        words.forEach(word => {
          if (word.length > 2) { // Only consider words longer than 2 chars
            const wordRegex = new RegExp(word, "i");
            orConditions.push(
              { name: wordRegex },
              { description: wordRegex },
              { "location.street": wordRegex },
              { "location.city": wordRegex },
              { "location.state": wordRegex }
            );
          }
        });
      }

      query.$or = orConditions;
    }

    // Only check for property type if it's provided and not 'All'
    if (propertyType && propertyType !== "All") {
      // Case-insensitive matching for property type
      const typePattern = new RegExp(`^${propertyType.trim()}$`, "i");
      query.type = typePattern;
    }

    // Add price range filter only if prices are provided
    if (minPrice || maxPrice) {
      query["rates.price"] = {};

      // Parse and validate price values
      if (minPrice) {
        const parsedMin = Number(minPrice);
        if (!isNaN(parsedMin) && parsedMin >= 0) {
          query["rates.price"].$gte = parsedMin;
        }
      }

      if (maxPrice) {
        const parsedMax = Number(maxPrice);
        if (!isNaN(parsedMax) && parsedMax >= 0) {
          query["rates.price"].$lte = parsedMax;
        }
      }
    }

    console.log("Search query:", JSON.stringify(query, null, 2));

    const properties = await Property.find(query);

    console.log(`Found ${properties.length} properties`);

    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};
