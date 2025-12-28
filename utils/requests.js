import axios from "axios";
// Prefer explicit API domain, but fall back to NEXT_PUBLIC_DOMAIN + /api
const computedApiDomain =
  process.env.NEXT_PUBLIC_API_DOMAIN ||
  (process.env.NEXT_PUBLIC_DOMAIN
    ? `${process.env.NEXT_PUBLIC_DOMAIN.replace(/\/$/, "")}/api`
    : null);
export const apiDomain = computedApiDomain;

///Function to get all properties
async function fetchProperties({ showFeatured = false } = {}) {
  try {
    if (!apiDomain) {
      return [];
    }
    const res = await axios.get(
      `${apiDomain}/properties${showFeatured ? "/featured" : ""}`,
      {
        cache: "no-store",
      }
    );

    return res?.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
///Function to get single property
async function fetchProperty(id) {
  try {
    if (!apiDomain) {
      return null;
    }
    const res = await axios.get(`${apiDomain}/properties/${id}`);
    return res?.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export { fetchProperties, fetchProperty };
/// Blog helpers
async function fetchBlogPosts({ page = 1, pageSize = 10, status = "published", q = "" } = {}) {
  try {
    if (!apiDomain) {
      return { total: 0, posts: [] };
    }
    const res = await axios.get(`${apiDomain}/blog`, {
      params: { page, pageSize, status, q },
    });
    return res?.data || { total: 0, posts: [] };
  } catch (error) {
    console.log(error);
    return { total: 0, posts: [] };
  }
}

async function fetchBlogPostBySlug(slug) {
  try {
    if (!apiDomain) {
      return null;
    }
    const res = await axios.get(`${apiDomain}/blog/slug/${slug}`);
    return res?.data || null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export { fetchBlogPosts, fetchBlogPostBySlug };
