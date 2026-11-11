# Tongric Domain Modules (`src/modules/`)

Each directory below represents a bounded domain module inside the Tongric Next.js modular monolith.

## Architecture Rules
1. Domain modules contain business rules, validation schemas, and database/service logic.
2. Domain modules must **never** import React UI components (`src/components/*` or `src/app/*`).
3. Next.js Route Handlers (`/api/*`) and Server Components delegate business operations to these modules.

## Modules
- `auth/` — Registration, login, sessions, RBAC guards, NDPA consent (Phase 3)
- `profiles/` — Farmer, Buyer, Transport profiles, verification docs & Benue catalogs (Phase 4)
- `marketplace/` — Produce listings, search & filters (Phase 5)
- `orders/` — Enquiries, offers, counter-offers, atomic order & quantity reservation (Phase 6)
- `logistics/` — Transport requests, quotes, linked deliveries & 6-step milestones (Phase 7)
- `notifications/` — Localized in-app notifications & external channel adapter (Phase 8)
- `i18n/` — Configurable translation dictionaries & validation status (Phase 2)
- `admin/` — Moderation, disputes, verification review & audit logs (Phases 4 & 8)
- `barter/` — Farmer-to-farmer exchange listings & agreements (Phase 9)
- `finance/` — Simple loan workflow demonstration & consented transaction snapshots (Phase 9)

