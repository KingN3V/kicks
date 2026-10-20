# Kicks JJ

A mobile-first catalog website for a small Kenyan shoe business that sells mainly on Instagram. Customers browse the shoes, pick a size, and tap a button that opens WhatsApp (or an Instagram DM) with the shoe, size and page link already typed in. The owner manages shoes, photos and stock from a private admin area on his phone.

**Live site:** https://kicksjj.netlify.app  
**API:** https://kicksjj-api.onrender.com (`/docs` for the interactive API reference)

<p align="center">
  <img src="docs/home.png" alt="Home page" width="230">
  <img src="docs/product.png" alt="Product page" width="230">
  <img src="docs/admin.png" alt="Admin edit screen" width="230">
</p>
## Why it works this way

The business takes orders by message, so there is no cart or online payment. The site's job is to show what is in stock, make the right message one tap away, and be easy for a non-technical owner to keep up to date.

## Features

**Public site**
- Catalog with filters (brand, category, size, price range) and pagination, all driven by the URL so links are shareable
- Product pages with a swipeable photo gallery, size buttons (sold-out sizes disabled) and link previews (Open Graph images cropped by Cloudinary)
- "Buy on WhatsApp" with a pre-filled message containing the shoe, size and page URL; Instagram DM button
- "Can't find your shoe?" request section that builds a message from the active filters
- Owner-chosen hero shoe on the home page, with an automatic fallback to the newest in-stock shoe
- Loading, error and not-found screens; automatic retries while the free backend wakes up

**Admin (private, JWT login)**
- List, search and filter shoes (including hidden ones)
- Add a shoe with sizes and stock; edit details; hide or show a shoe
- Upload photos to Cloudinary, reorder them (the first photo is the cover) and delete them
- Set stock per size; feature one shoe on the home page
- Admin pages are marked `noindex` so search engines skip them

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2 |
| Database | PostgreSQL (Neon) |
| Auth | JWT (python-jose), bcrypt password hash stored as an environment variable |
| Images | Cloudinary (upload validation, resizing on upload) |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS 4 |
| Hosting | Render (API), Netlify (frontend), Neon (database), Cloudinary (images) |

## Project structure

```
backend/
  app/
    main.py            FastAPI app, CORS, routers
    config.py          environment variables (fails fast if one is missing)
    database.py        engine and session
    models.py          Product, Variant, ProductImage
    schemas.py         public response shapes
    schemas_admin.py   admin request/response shapes
    security.py        password hashing, JWT
    slugs.py           unique URL slugs
    images.py          Cloudinary upload and validation
    routers/           products.py (public), auth.py, admin.py
    seed.py            sample data for local development
  alembic/             database migrations
  render.yaml          Render service definition
frontend/
  app/                 pages: public site (route group) and /admin
  components/          Hero, ProductCard, Filters, BuyPanel, ...
  lib/                 api.ts (public), adminApi.ts (admin), contact.ts
  netlify.toml         Netlify build plugin
```

## API overview

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | health check |
| GET | `/products` | visible shoes; filters and pagination |
| GET | `/products/filters` | values for the filter dropdowns |
| GET | `/products/featured` | the hero shoe, or `null` |
| GET | `/products/{slug}` | one visible shoe |
| POST | `/auth/login` | returns a JWT |
| * | `/admin/...` | create, list, edit, stock, photos, uploads; every route requires the admin token |

## Running it locally

You need Python 3, Node.js, a PostgreSQL database, and a free Cloudinary account.

**Backend** (from `backend/`)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/kicksjj
SECRET_KEY=a-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash, see below>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CORS_ORIGINS=http://localhost:3000
```

Use the same driver prefix as your installed PostgreSQL driver (the example assumes psycopg).

Generate the admin password hash:

```bash
python -c "import getpass; from app.security import hash_password; print(hash_password(getpass.getpass()))"
```

Then create the tables, load sample data and start the API:

```bash
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

The API is now at http://localhost:8000 (docs at `/docs`).

**Frontend** (from `frontend/`)

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
SITE_URL=http://localhost:3000
WHATSAPP_NUMBER=254700000000
INSTAGRAM_HANDLE=yourhandle
```

```bash
npm install
npm run dev
```

The site is at http://localhost:3000 and the admin at http://localhost:3000/admin.

## Design decisions

- **Prices are whole shillings (integers)** and **sizes are strings**, so "42.5" works and there are no decimal surprises.
- **Hidden shoes return 404 publicly** instead of a "hidden" page, so they cannot be discovered.
- **The admin guard is on the router**, so every admin route is protected and a new route cannot forget it.
- **PATCH only changes the fields that were sent**, and NOT NULL fields reject explicit nulls with a clean 422.
- **Only one shoe can be featured at a time.** The admin endpoint clears the flag on the others in the same transaction.
- **Free hosting sleeps.** The frontend retries requests for up to ~25 seconds and shows a friendly screen that reloads itself, so the first visit after idle time works instead of failing.
- **Secrets live in environment variables only**, including the admin password hash.

## Known limitations

- No delete button for shoes or sizes yet (shoes are hidden instead)
- Renaming a shoe does not change its URL slug
- Deleted photos stay in Cloudinary
- No automated tests yet

## Author

Built by Neville ([@KingN3V](https://github.com/KingN3V)) for a friend's shoe business.
