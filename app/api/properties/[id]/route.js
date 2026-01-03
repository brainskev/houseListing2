import connectDB from "@/config/db";
import Property from "@/models/Property";
import { getSessionUser } from "@/utils/getSessionUser";
export const dynamic = "force-dynamic";
///Get /api/properties/:id
export const GET = async (request, { params }) => {
  try {
    await connectDB();
    const property = await Property.findById(params.id);
    if (!property) return new Response("Property Not Found", { status: 404 });
    return new Response(JSON.stringify(property), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response("somethhing went wrong", { status: 500 });
  }
};
// DELETE /api/properties/:id
export const DELETE = async (request, { params }) => {
  try {
    const propertyId = params.id;

    const sessionUser = await getSessionUser();

    // Check for session
    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }

    const { userId } = sessionUser;

    await connectDB();

    const property = await Property.findById(propertyId);

    if (!property) return new Response('Property Not Found', { status: 404 });

    // Verify ownership or admin role (assistants cannot delete)
    const userRole = sessionUser.user?.role;
    if (property.owner.toString() !== userId) {
      if (userRole !== 'admin') {
        return new Response('Unauthorized - Only property owner or admin can delete', { status: 403 });
      }
    }

    await property.deleteOne();

    return new Response(
      JSON.stringify({ message: "Property Deleted Successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new Response('Something Went Wrong', { status: 500 });
  }
};

//PUT /api/properties/:id
export const PUT = async (request, { params }) => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }
    const { id } = params
    const { userId } = sessionUser;
    const formData = await request.formData();
    // Access all values from amenities 
    const amenities = formData.getAll('amenities');
    const existingImages = formData.getAll('existing_images');
    const images = formData.getAll('images').filter((image) => image && image.name !== "");
    // Get Property to Update
    const existingProperty = await Property.findById(id)
    if (!existingProperty) {
      return new Response("Property does not exist", { status: 404 })
    }

    //verify Ownership or admin role
    const userRole = sessionUser.user?.role;
    if (existingProperty.owner.toString() !== userId && userRole !== 'admin') {
      return new Response("Unauthorized", { status: 401 })
    }
    // Create propertyData object for database
    const propertyData = {
      type: formData.get('type'),
      name: formData.get('name'),
      description: formData.get('description'),
      location: {
        street: formData.get('location.street'),
        city: formData.get('location.city'),
        state: formData.get('location.state'),
        zipcode: formData.get('location.zipcode'),
      },
      beds: formData.get('beds'),
      baths: formData.get('baths'),
      square_feet: formData.get('square_feet'),
      amenities,
      rates: {
        // Ensure price persists and keys are correct
        price: formData.get('rates.price'),
        weekly: formData.get('rates.weekly'),
        monthly: formData.get('rates.monthly'),
        nightly: formData.get('rates.nightly'),
      },
      seller_info: {
        name: formData.get('seller_info.name'),
        email: formData.get('seller_info.email'),
        phone: formData.get('seller_info.phone'),
      },
      show_in_hero: formData.get('show_in_hero') === 'true',
      owner: userId,
    };

    // Handle image uploads (merge existing + new)
    const uploadedImages = [];
    for (const image of images) {
      const imageBuffer = await image.arrayBuffer();
      const imageArray = Array.from(new Uint8Array(imageBuffer));
      const imageData = Buffer.from(imageArray);
      const imageBase64 = imageData.toString('base64');
      const result = await (await import('@/config/cloudinary')).default.uploader.upload(
        `data:image/png;base64,${imageBase64}`,
        { folder: 'propertypulse' }
      );
      uploadedImages.push(result.secure_url);
    }
    propertyData.images = [...existingImages, ...uploadedImages];

    //find and update property in database
    const updatedProperty = await Property.findByIdAndUpdate(id, propertyData, { new: true });

    return new Response(JSON.stringify(updatedProperty), {
      status: 200,
    });
  } catch (error) {
    return new Response('Failed to update property', { status: 500 });
  }
};

// PATCH /api/properties/:id - Quick update for specific fields
export const PATCH = async (request, { params }) => {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
      return new Response('User ID is required', { status: 401 });
    }

    const { id } = params;
    const { userId } = sessionUser;
    const body = await request.json();

    console.log(`PATCH /api/properties/${id}`, body);

    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return new Response('Property does not exist', { status: 404 });
    }

    // Verify ownership or admin role
    const userRole = sessionUser.user?.role;
    if (existingProperty.owner.toString() !== userId && userRole !== 'admin') {
      return new Response('Unauthorized', { status: 401 });
    }

    // Only allow updating show_in_hero field via PATCH
    if (body.hasOwnProperty('show_in_hero')) {
      existingProperty.show_in_hero = body.show_in_hero;
      await existingProperty.save();
      console.log(`Property ${id} updated: show_in_hero=${body.show_in_hero}`);
    }

    return new Response(JSON.stringify(existingProperty), { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return new Response('Failed to update property', { status: 500 });
  }
};