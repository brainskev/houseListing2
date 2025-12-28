import fs from 'fs';
import path from 'path';
import connectDB from '../config/db.js';
import BlogPost from '../models/BlogPost.js';
import mongoose from 'mongoose';

// Load .env.local manually for MONGODB_URL
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) {
      const key = m[1];
      let val = m[2];
      // strip quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await BlogPost.findOne({ slug });
    if (!exists) return slug;
    slug = `${baseSlug}-${suffix++}`;
  }
}

async function main() {
  await connectDB();
  const title = 'Test Blog Post';
  const baseSlug = 'test-blog-post';
  const slug = await ensureUniqueSlug(baseSlug);

  const post = await BlogPost.create({
    title,
    slug,
    content: '<p>This is a seeded blog post for testing.</p>',
    author: new mongoose.Types.ObjectId(),
    status: 'published',
    // featuredImage omitted to avoid external image optimizer fetch during dev
    gallery: [],
  });

  console.log('Seeded blog post:', { id: post._id.toString(), slug: post.slug, status: post.status });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
