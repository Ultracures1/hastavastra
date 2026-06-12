# Hastavastra E-Commerce

Full-stack e-commerce site:

- **`server.js` + `routes/` + `db/`** — Express backend with REST API, JWT admin auth and image uploads
- **`app/`** — React (Vite + TypeScript + Tailwind) storefront **and admin panel**
- **Database** — MySQL in production (Hostinger), automatic SQLite fallback for local development (no setup needed)

The storefront is served at `/`, the admin panel at `/admin`.

## Quick start (local development)

```bash
# 1. Backend (uses a local SQLite file automatically — no MySQL needed)
npm install
npm start                  # API on http://localhost:3001

# 2. Frontend (in a second terminal)
cd app
npm install
npm run dev                # site on http://localhost:3000 (proxies /api to :3001)
```

Open http://localhost:3000/admin and log in with the default account:

- **Email:** `admin@hastavastra.com`
- **Password:** `admin123`

**Change this password immediately** in Admin → Account (or set `ADMIN_EMAIL` /
`ADMIN_PASSWORD` in `.env` before the first start).

Tables are created automatically on first start and seeded with the demo
products/content, so the site looks exactly like before — but now everything
is editable in the admin panel.

## What can be managed from the admin panel

| Section | What it controls |
|---|---|
| Products | All products in the four homepage sections (name, price, discount price, badge, sizes, image, visibility, order) |
| Categories | The circular category links and the featured-categories grid |
| Testimonials | The customer testimonials carousel |
| Site Content | Announcement bar messages, marquee text, hero text/images, the three banners, "featured in" logos, section titles |
| Account | Change the admin password |

Images can be uploaded directly from the admin panel (stored in `/uploads`).

## Production deployment (Hostinger)

1. Create a MySQL database in hPanel (**Databases → MySQL**) and note the
   name, user and password.
2. Copy `.env.example` to `.env` and fill in:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET` — a long random string
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — your admin login (used on first start)
3. Build the frontend: `npm run build` (this runs `npm install` + `vite build`
   inside `app/` and produces `app/dist`, which the server serves).
4. Install backend dependencies: `npm install`
5. Start: `npm start` (entry point `server.js`). The app listens on `PORT`
   (set automatically by most hosts).

When MySQL env vars are present the server uses MySQL; tables are created and
seeded automatically on the first start.

## API overview

Public:
- `GET /api/storefront` — all data the storefront needs
- `GET /api/health`

Admin (require `Authorization: Bearer <token>` from `POST /api/auth/login`):
- `GET/POST /api/products`, `PUT/DELETE /api/products/:id`
- `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`
- `GET/POST /api/testimonials`, `PUT/DELETE /api/testimonials/:id`
- `GET/PUT /api/settings`
- `POST /api/uploads` — multipart image upload (field `image`), returns `{ url }`
- `GET /api/auth/me`, `PUT /api/auth/password`
