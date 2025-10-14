import connectDB from "@/config/db";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
import cloudinary from "@/config/cloudinary";
///Get /api/properties
export const GET = async (request) => {
  try {
    await connectDB();
    const page = request.nextUrl.searchParams.get("page") || 1;
    const pageSize = request.nextUrl.searchParams.get("pageSize") || 6;
    const skip = (page - 1) * pageSize;
    const total = await Property.countDocuments({});
    const properties = await Property.find({}).skip(skip).limit(pageSize);
    const result = {
      total,
      properties,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return new Response("Something went wrong", { status: 500 });
  }
};

//Post /api/properties

export const POST = async (request) => {
  try {
    await connectDB();
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 401 });
    }

    const formData = await request.formData();
    const amenities = formData.getAll("amenities");
    const images = formData.getAll("images").filter(img => img.name);

    const propertyData = {
      type: formData.get("type"),
      name: formData.get("name"),
      description: formData.get("description"),
      location: {
        street: formData.get("location.street"),
        city: formData.get("location.city"),
        state: formData.get("location.state"),
        zipcode: formData.get("location.zipcode"),
      },
      beds: formData.get("beds"),
      baths: formData.get("baths"),
      square_feet: formData.get("square_feet"),
      amenities,
      rates: {
        weekly: formData.get("rates.weekly"),
        monthly: formData.get("rates.monthly"),
        nightly: formData.get("rates.nightly"),
      },
      seller_info: {
        name: formData.get("seller_info.name"),
        email: formData.get("seller_info.email"),
        phone: formData.get("seller_info.phone"),
      },
      owner: sessionUser.userId,
    };

    // Upload images to Cloudinary
    propertyData.images = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const result = await cloudinary.uploader.upload(
          `data:image/png;base64,${buffer.toString("base64")}`,
          { folder: "propertypulse" }
        );
        return result.secure_url;
      })
    );

    const newProperty = await Property.create(propertyData);

    return new Response(JSON.stringify({ propertyId: newProperty._id }), { status: 201 });
  } catch (error) {
    console.error("Error adding property:", error);
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
};
