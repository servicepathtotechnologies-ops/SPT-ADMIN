# SPT Admin CRM

Standalone admin panel for tracking **contacts** (contact form submissions) and **demos** (demo booking requests). Uses the existing SPT-BACKEND API with JWT authentication.

## Features

- **Login** — Email + password (JWT via backend)
- **Dashboard** — KPIs (total contacts, demos, new leads) and recent activity
- **Contacts** — List, filter by status, update status, delete, export CSV
- **Demos** — List, filter by status, update status, delete, export CSV
- **Status tracking** — Each lead has a status: `new`, `contacted`, `qualified`, `converted`, `lost`

## Setup

1. **Backend**  
   Ensure [SPT-BACKEND](../SPT-BACKEND) is running and the database has the `status` column on `contacts` and `demos`.  
   If the DB was created before status was added, run:

   ```bash
   cd ../SPT-BACKEND
   # In Supabase SQL Editor (or your PostgreSQL client), run:
   # sql/migrations/001_add_status_to_contacts_demos.sql
   ```

2. **Environment**  
   Copy `.env.example` to `.env` and set:

   ```env
   BACKEND_URL=http://localhost:5000
   ```

   Use the URL where SPT-BACKEND is running (no trailing slash).

3. **Install and run**

   ```bash
   npm install
   npm run dev
   ```

   App runs at **http://localhost:3001** (port 3001 to avoid clashing with the main frontend).

4. **Admin login**  
   Admin signs in with the **email and password** set in **SPT-BACKEND** `.env` (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Create that admin once:

   ```bash
   cd ../SPT-BACKEND
   npm run create-admin
   ```

   The script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, creates the admin in the database, and that is the **only** account that can log in to the admin panel. Then sign in at http://localhost:3001/login with those same credentials.

## Project structure

- `src/app/login` — Login page
- `src/app/dashboard` — Overview, Contacts, Demos (sidebar nav)
- `src/app/api` — Proxies to SPT-BACKEND (login, contacts, demos)
- `src/lib/api.ts` — Client API helpers (with token)
- `src/lib/types.ts` — Contact, Demo, status types

This app is **separate** from the main SPT-FRONTEND; it does not share code or routes with the marketing site.
