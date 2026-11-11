# TONGRIC — PRODUCT & TECHNICAL DECISIONS LOG

**Source Document:** [product-concept.md](reference-docs/product-concept.md)  
**Purpose:** Tracks foundational constraints, architectural recommendations, resolved product owner decisions, and open questions requiring alignment before implementing each phase.

---

## 1. Confirmed Baseline Constraints (From Master Prompt & Concept Doc)
1. **Pilot Focus:** Benue State, Nigeria (priority on perishable produce: tomatoes, pepper, mangoes, plus local staples).
2. **Core Technology Starting Point:** Next.js, TypeScript, Tailwind CSS; PostgreSQL + Prisma ORM recommended.
3. **Visual Identity:** Clean solid white background, multi-shade green primary palette, neutral grey borders, high-contrast dark text, mobile-first, minimal animations, zero bloated/generic charts.
4. **Financial Compliance (Concept Doc Sec 19, 27):** No unlicensed lending, no escrow, no customer-fund custody in Release 1. Financial institutions retain underwriting/approval/disbursement authority.
5. **Language Integrity (Concept Doc Sec 4.3):** No blind assumption that machine translation is accurate for Nigerian agricultural/financial terms; translations must be centrally structured and native-speaker validated.
6. **Data Protection (Concept Doc Sec 27):** Design in accordance with the Nigeria Data Protection Act (NDPA) 2023 (consent, data minimization, private storage for KYC docs, audit logging).

---

## 2. Architectural Recommendations (Pending Approval)
*All Phase 1 UI component architecture recommendations have been reviewed and recorded below.*

---

## 3. Open Product Decisions To Resolve Sequentially (Do Not Assume)

### Before / During Phase 1
*All Phase 1 decisions are resolved (see Section 4).*

### Before / During Phase 2
- **Q-2.1:** Exact 3 pilot interface languages for Benue State (Concept Doc 4.3 lists English, Tiv, Hausa, Yoruba, Igbo, Fulfulde, Kanuri; clarify whether Benue pilot uses English + Tiv + Hausa, or Idoma / Nigerian Pidgin)?
- **Q-2.2:** Who will supply and validate local-language agricultural translations?

### Before / During Phase 3
- **Q-3.1:** Primary login credential for farmers & drivers: **Phone number + PIN/password**, **Phone OTP** (incurs per-SMS cost), or **Email + password**?
- **Q-3.2:** Password reset channel for farmers without email addresses (SMS OTP vs. Admin/Community Agent assisted reset vs. security recovery code)?
- **Q-3.3:** Should "Community Agent" (assisted onboarding) be a distinct account role in Release 1, or handled via Admin/cooperative support?

### Before / During Phase 4
- **Q-4.1:** What verification documents are required per role (especially for rural farmers without formal government/business IDs)?
- **Q-4.2:** Can unverified farmers list produce immediately (with an "Unverified" badge), or must verification happen prior to listing/quoting for Farmers, Buyers, and Transport Providers?
- **Q-4.3:** Should user phone numbers be hidden until an offer/order is accepted, or visible immediately on listings?

### Before / During Phase 5–6
- **Q-5.1:** Produce units & pricing model (standard Nigerian market units like baskets/bags/crates alongside kg + optional kg estimate for transport matching).
- **Q-6.1:** Offer expiration rules for perishable crops (e.g., default 24h/48h expiry) and pre-collection cancellation policy.
- **Q-6.2:** Are Buyer Purchase Requests (open RFQs) mandatory in Release 1 or deferrable?

### Before / During Phase 7–9
- **Q-7.1:** Who initiates and pays for transport (Buyer, Farmer, or negotiable per order), and is transport matched via open quotes, direct provider request, or both?
- **Q-8.1:** MVP notification channels: in-app only, in-app + email, or paid SMS gateway (e.g., Termii/Africa's Talking)?
- **Q-9.1:** Barter rules (1-to-1 single swaps vs. partial swaps; whether Tongric logistics handles one-way or two-way swap deliveries).
- **Q-9.2:** Simple Loan Workflow Demo: Admin-operated partner simulation vs. external Financial Partner login portal?

---

## 4. Approved Decisions Record
- **DEC-001 (2026-11-11 — Architecture):** Single **Next.js App Router modular monolith** at workspace root (`src/`) using TypeScript, Tailwind CSS, `npm`, and bounded `src/modules/*` services; hybrid request pattern (Server Components read modules directly; `/api/*` JSON Route Handlers handle mutations and external testability). *Supersedes Concept Doc Sec 16 dual Express server.*
- **DEC-002 (2026-11-11 — UI Kit):** Custom lightweight accessible React + Tailwind CSS v4 primitives + `lucide-react` icons (`Button`, `FormField`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `Alert`, `StatusStepper`, `EmptyState`, `LoadingSkeleton`, `Spinner`, native `<dialog>` `Dialog`), zero external JS UI bloat for 2G/3G low-end Android devices.
- **DEC-003 (2026-11-11 — Roadmap Sequencing):** Approved 10-phase roadmap separating core marketplace/logistics/admin (Phases 1–8) from extended Barter & Simple Loan Demo modules (Phase 9).
- **DEC-004 (2026-11-11 — Hosting Portability / Q-1.3):** Keep Next.js configuration host-portable for local development first; select live cloud hosting before deployment.
- **DEC-005 (2026-11-11 — Testing Stack):** **Vitest + React Testing Library** configured (`environment: "node"` default; React components verified via `react-dom/server` static rendering in unit tests plus live Next.js route checks).
- **DEC-006 (2026-11-11 — PWA & Responsive Navigation):** Platform is **PWA-enabled** via native Next.js `src/app/manifest.ts` + lightweight `public/sw.js` (never caching `/api/*` or live inventory). Mobile view (`< 768px`) uses a 5-tab bottom bar (**`Home`, `Market`, `Orders`, `Transport`, `Finance`**) with `Account` and upcoming language switcher in the top header; larger screens (`>= 768px`) use a simple single-row top bar.
- **DEC-007 (2026-11-11 — Database & Schema Strategy / Q-1.1):** Supabase managed PostgreSQL connected via IPv4-compatible Session Pooler (`:5432`) in `.env`, with incremental Prisma migrations per phase (starting with `AuditLog` in Feature 1.2).
- **DEC-008 (2026-11-11 — Visual Styleguide Guard):** Dev-only `/styleguide` route (`dynamic = "force-dynamic"`) returns `404` in production (`NODE_ENV === "production"`).
- **DEC-009 (2026-11-11 — Farmer / Buyer Workspace Mode Switch):** Header `Farmer | Buyer` toggle enables dual-capable users (or farmers browsing to buy) to switch workspace views cleanly, while Phase 3 server RBAC will strictly enforce profile/verification rules per action.
- **DEC-010 (2026-11-11 — File Storage / Q-1.2):** Use **Cloudinary** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) via `StorageProvider` abstraction with `.tongric-local-storage/` fallback for offline tests/unconfigured local dev. Public produce photos use `type: "upload"` (`<= 2MB`, JPEG/PNG/WebP); private KYC/loan documents use `type: "private"` (`<= 5MB`, JPEG/PNG/WebP/PDF) with `<= 120s` signed download URLs and magic-byte validation. *(Note: Cloudinary free accounts require enabling PDF delivery in dashboard security settings if PDF uploads are used.)*
- **DEC-011 (2026-11-11 — Connectivity Resilience):** Use `NetworkStatusBanner`, `/offline` PWA fallback route in `public/sw.js` (zero `/api/*` caching), and `resilientFetch` (auto-retrying safe `GET` requests while injecting `Idempotency-Key` on mutations without automatic duplicate submission).


