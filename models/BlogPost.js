import mongoose from "mongoose";

const FeaturedImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    },
    { _id: false }
);

const GalleryImageSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
    },
    { _id: false }
);

const BlogPostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 200 },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        featuredImage: { type: FeaturedImageSchema, required: false },
        content: { type: String, required: true }, // sanitized HTML
        gallery: { type: [GalleryImageSchema], default: [] },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["draft", "published"], default: "draft" },
        publishedAt: { type: Date },
    },
    { timestamps: true }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });

BlogPostSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        if (this.status === "published" && !this.publishedAt) {
            this.publishedAt = new Date();
        }
        if (this.status === "draft") {
            this.publishedAt = undefined;
        }
    }
    next();
});

const BlogPost = mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);

export default BlogPost;
