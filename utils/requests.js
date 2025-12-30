import axios from "axios";
export const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null;
const isServer = typeof window === "undefined";
const getBaseUrl = () => process.env.NEXT_PUBLIC_DOMAIN || process.env.NEXTAUTH_URL || "http://localhost:3000";

///Function to get all properties
async function fetchProperties({ showFeatured = false } = {}) {
  try {
    // Prefer same-origin fetch on the server to preserve cookies/session
    if (isServer || !apiDomain) {
      const base = getBaseUrl();
      const res = await fetch(`${base}/api/properties${showFeatured ? "/featured" : ""}`, { cache: "no-store" });
      if (!res.ok) return [];
      return await res.json();
    }
    const res = await axios.get(`${apiDomain}/properties${showFeatured ? "/featured" : ""}`, { cache: "no-store" });
    return res?.data;
  } catch (error) {
    console.log(error);
    return [];
  }
}
///Function to get single property
async function fetchProperty(id) {
  try {
    if (isServer || !apiDomain) {
      const base = getBaseUrl();
      const res = await fetch(`${base}/api/properties/${id}`, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
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
    const params = { page, pageSize, status, q };
    if (isServer || !apiDomain) {
      const base = getBaseUrl();
      const sp = new URLSearchParams({ page: String(page), pageSize: String(pageSize), status, q });
      const res = await fetch(`${base}/api/blog?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) return { total: 0, posts: [] };
      return (await res.json()) || { total: 0, posts: [] };
    }
    const res = await axios.get(`${apiDomain}/blog`, { params, withCredentials: true });
    return res?.data || { total: 0, posts: [] };
  } catch (error) {
    console.log(error);
    return { total: 0, posts: [] };
  }
}

async function fetchBlogPostBySlug(slug) {
  try {
    if (isServer || !apiDomain) {
      const base = getBaseUrl();
      const res = await fetch(`${base}/api/blog/slug/${slug}`, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) || null;
    }
    const res = await axios.get(`${apiDomain}/blog/slug/${slug}`, { withCredentials: true });
    return res?.data || null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export { fetchBlogPosts, fetchBlogPostBySlug };
