# Copilot Instructions

- Stack: Next.js 14 app router with Tailwind, NextAuth (Google), Mongoose/MongoDB, Cloudinary image uploads, Mapbox hooks (maps currently commented). Layout wraps `GlobalProvider` + `AuthProvider` with `Navbar`/`Footer` and `ToastContainer` in `app/layout.jsx`.
- Dev scripts: `npm run dev` (3000), `npm run build`, `npm run start`, `npm run lint`. Env required in `.env.local` (see `README.md`): `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_API_DOMAIN` (set to `http://localhost:3000/api` in dev or data fetchers return empty), `MONGODB_URL`, Google OAuth, NextAuth secret/URLs, Cloudinary creds.
- Auth: `authOptions` in `utils/authOptions.js` sets Google provider; `session` callback injects `user.id`. `middleware.js` protects `/properties/add`, `/profile`, `/properties/saved`, `/messages`. Use `getSessionUser` in server routes to enforce auth; it returns a Response on failure, so null/Response guards are needed before accessing `userId`.
- Data layer: `config/db.js` memoizes the mongoose connection via `connected` flag—always call `connectDB()` before model ops. Models live in `models/Property`, `User`, `Message` (bookmarks array on `User`; `Message.read` toggled for inbox state).
- API conventions (app router):
  - All server routes live under `app/api/**`; responses use `new Response(...)` and often set `dynamic = "force-dynamic"` for user-scoped data (bookmarks/messages).
  - Properties: `GET /api/properties` paginates via `page`/`pageSize` query, returns `{ total, properties }`. `POST /api/properties` consumes `multipart/form-data` with fields like `location.city`, `rates.price`, `amenities`, and `images` (files); images upload to Cloudinary folder `propertypulse` and redirect to the new property page. `PUT /api/properties/:id` and `DELETE` require ownership via `getSessionUser`.
  - Search: `GET /api/properties/search` builds regex query across name/description/location; optional `propertyType` filter unless `All`.
  - User listings: `GET /api/properties/user/:userId` fetches owner’s properties without auth.
  - Bookmarks: `POST /api/bookmark` toggles membership of `propertyId` in `user.bookmarks` and returns `{ message, isBookmarked }`; `GET /api/bookmark` resolves bookmarked property docs; `POST /api/bookmark/check` reports boolean.
  - Messages: `POST /api/messages` requires auth and blocks sending to self; `GET /api/messages` returns unread first (then read) populated with sender username and property name; `PUT /api/messages/:id` toggles `read`; `DELETE` removes if recipient matches; `GET /api/messages/unread-count` returns `{ count }`.
- Client patterns:
  - Many UI pieces are server components; data fetching uses `fetchProperties`/`fetchProperty` (`utils/requests.js`) which depend on `NEXT_PUBLIC_API_DOMAIN` and return safe fallbacks.
  - `PropertyAddForm` uses a plain form posting to `/api/properties` (fields must match server expectations; amenities/images are arrays). `PropertyEditForm` is client-side, loading initial data via `fetchProperty` then `axios.put` with `FormData`.
  - Messaging: `PropertyContactForm` posts JSON to `/api/messages` and handles common error messages; message list uses `axios.get` to `/api/messages`.
  - Notifications: `GlobalContext` holds `unReadCount`; `components/UnReadMessageCount` calls `/api/messages/unread-count` on mount when a session exists.
- Styling/UI: Tailwind configured in `tailwind.config.js` (Poppins font, `grid-cols-70/30` shortcut); global styles in `assets/styles/globals.css`. Photoswipe and toast CSS loaded in layout.
- Common gotchas: README still references a `pages/` layout; actual routing is in `app/`. Keep API routes dynamic when user-specific, call `connectDB` before queries, and preserve form field names expected by server routes (e.g., `rates.price`, `location.city`).

Keep this file concise (~20-50 lines). When adding features, align with the patterns above and prefer reusing helpers/components before introducing new fetch/auth flows.
