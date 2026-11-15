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
*All Phase 2 decisions (`DEC-012`–`DEC-017`) are resolved.*

### Before / During Phase 3 (Resolved)
- ~~**Q-3.1:** Primary login credential for farmers & drivers?~~ -> **Resolved (`DEC-018`):** Nigerian Phone Number (`+234`) + 8+ char password (optional email).
- ~~**Q-3.2:** Password reset channel for farmers without email addresses?~~ -> **Resolved (`DEC-019`):** One-time `TGR-XXXXX-XXXXX` recovery code shown once at signup + Admin-assisted reset + optional email reset.
- ~~**Q-3.3:** Should "Community Agent" be a distinct account role?~~ -> **Resolved (`DEC-020`):** Keep 4 core roles (`FARMER`, `BUYER`, `TRANSPORT_PROVIDER`, `ADMIN`) and track assisted onboarding via `User.assistedByUserId`.

### Before / During Phase 4
- **Q-4.1:** What verification documents are required per role (especially for rural farmers without formal government/business IDs)?
- **Q-4.2:** Can unverified farmers list produce immediately (with an "Unverified" badge), or must verification happen prior to listing/quoting for Farmers, Buyers, and Transport Providers?
- **Q-4.3:** Should user phone numbers be hidden until an offer/order is accepted, or visible immediately on listings?

### Before / During Phase 5–6 (Resolved)
- ~~**Q-6.1:** Offer expiration rules for perishable crops (e.g., default 24h/48h expiry) and pre-collection cancellation policy.~~ -> **Resolved (`DEC-031`):** 24 hours for perishable crops (tomatoes, pepper, mangoes) vs 72 hours for staples (yam, rice, maize); 3 counter-offer rounds maximum.
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
- **DEC-012 (2026-11-11 — Pilot Languages Scope / Q-2.1):** Configure **4 Benue pilot languages** — **English (`en`)**, **Tiv (`tiv`)**, **Idoma (`ido`)**, and **Hausa (`ha`)**. *Updates Concept Doc Sec 4.3 (adding Idoma for Benue State coverage) and expands Sec 22's `3`-language target to `4`.*
- **DEC-013 (2026-11-11 — Translation Validation Gate / Q-2.2):** Ship complete English base dictionary (`VALIDATED`) and `DRAFT` empty slots for local languages via `npm run i18n:sync`. Only `VALIDATED` non-empty strings render to end-users; `DRAFT`, `REVIEWED`, and missing entries fall back strictly to English until native-speaker reviewers approve them.
- **DEC-014 (2026-11-11 — Language Selector & Onboarding UX):** New visitors see a dismissible 4-language `FirstVisitLanguagePrompt` card; header displays compact `Globe + code` `LanguageSwitcher` opening an accessible `Dialog` with native names and honest coverage badges (`Ready` vs `X/Y reviewed`), persisted via `httpOnly` `tongric_locale` cookie via `POST /api/preferences/language`.
- **DEC-015 (2026-11-11 — Produce Units & Kg Estimation / Q-5.1):** Support Benue market units (`basket`, `bag`, `crate`, `basin`, `kg`, `tonne`, `unit`) with standard kg weight defaults + optional per-unit kg override via `estimateWeightKg()` for logistics capacity matching.
- **DEC-016 (2026-11-11 — Pilot Crop Catalog & Benue LGAs):** Include all Benue priority crops (`tomatoes`, `pepper`, `mangoes` tagged perishable, plus `cashew`, `yam`, `cassava`, `rice`, `maize`, `soybeans`, and `other`) and all `23` official Benue LGAs via translatable catalog keys.
- **DEC-017 (2026-11-11 — Photo Compression & Low-Data Mode):** Automatically resize/compress upload photos client-side (`<= 1280px`, `<= 200 KB` WebP/JPEG fallback) via native Canvas in `src/lib/media/image-compressor.ts`, paired with a `localStorage`-persisted **Low-Data Mode** switch and `<LowDataImage />` tap-to-load deferral.


- **DEC-018 (Feature 3.1 Auth Identifier):** Primary authentication credential is canonical Nigerian Phone Number (`+234...` E.164 normalization from `070`/`080`/`081`/`090`/`091` or `234...`) + 8–128 character password (`node:crypto` salted `scrypt`), with email kept strictly optional so phoneless-email rural farmers can register at `$0` SMS cost.
- **DEC-019 (Feature 3.1 Rural Password Recovery):** At signup, every account receives one human-readable recovery code (`TGR-XXXXX-XXXXX`, stored only as a salted `scrypt` hash in `RecoveryCode` and displayed once with explicit user acknowledgment), supplemented by Admin-assisted recovery and optional email reset in Feature 3.2.
- **DEC-020 (Feature 3.1 Core Roles & Assisted Onboarding):** Account creation uses the 4 core roles (`FARMER`, `BUYER`, `TRANSPORT_PROVIDER`, `ADMIN`); `ADMIN` is blocked from public signup. Cooperative/Admin assisted registration is tracked via nullable `User.assistedByUserId`. Farmers retain dual `Farmer | Buyer` header perspective switching (`DEC-009`) without creating duplicate accounts.
- **DEC-021 (Feature 3.1 Header Account Slot):** Activate the desktop & mobile header `Account` button to link to `/register` in Feature 3.1 before Feature 3.2 wires `/login` and authenticated `/account`.
- **DEC-022 (Feature 3.2 Session Storage & Revocation):** Database-backed sessions stored in `Session` table with SHA-256 hashed token (`sessionHash`), 30-day lifetime, and `tongric_session` HTTP-only cookie (`SameSite=Lax`, `Path=/`). Enables immediate server-side revocation on logout, account lock, or password reset.
- **DEC-023 (Feature 3.2 Offline Recovery Reset & Accessibility):** Single-use recovery code consumption (`POST /api/auth/recover`) resets password, marks `RecoveryCode.isUsed = true`, revokes all active sessions, and logs `AuditLog` event. UI copy is kept concise, direct, and free of unnecessary jargon.
- **DEC-024 (Feature 3.3 Role-Based Access Control & Guards):** Server-side session verification via `getServerSession()`, `requireAuth()`, and `requireRole([roles])` helpers. Unauthorized/forbidden attempts yield structured `401`/`403` responses or clear inline warnings with direct action buttons.
- **DEC-025 (Feature 3.3 Assisted Onboarding Verification & Audit):** Assisted farmer onboarding via `POST /api/admin/assisted-register` strictly verifies calling operator has `ADMIN` role, attaches `assistedByUserId`, and logs `ACTOR_ASSISTED_USER_REGISTERED` linking operator and beneficiary.
- **DEC-026 (Feature 4.1 Structured Farmer Profile & Verification Lifecycle):** Farmer profile captures standardized Benue State LGA, community/village, primary crops from the catalog, optional cooperative name, and optional farm size in hectares. Introduces `VerificationStatus` enum (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`), defaulting to `UNVERIFIED`. The profile is 1-to-1 with `User` (`FarmerProfile`), emits `FARMER_PROFILE_UPDATED` audit log entries, and displays a clean completeness indicator on `/account`.
- **DEC-027 (Feature 4.2 Buyer & Transport Provider Profiles):** Buyer profile captures business name, structured buyer type (`PROCESSOR`, `WHOLESALER`, `RETAILER`, `RESTAURANT_HOTEL`, `INSTITUTIONAL`), operating LGA, and primary crops sourced. Transporter profile captures operator/business name, vehicle types (`MOTORCYCLE_TRICYCLE`, `PICKUP`, `VAN`, `TRUCK`), maximum capacity in kg (50–50,000 kg), operating LGAs (1–23 Benue LGAs), availability status (`isAvailable`), and pricing model preference (`FIXED_RATE_CARD` / `QUOTE_ON_REQUEST`). Both link 1-to-1 with `User`, emit audit log entries (`BUYER_PROFILE_UPDATED`, `TRANSPORTER_PROFILE_UPDATED`), and display role-specific status cards on `/account`.
- **DEC-028 (Feature 4.3 Verification Document Submission & Minimal Admin Review):** Verification documents are uploaded through private cloud storage (`StorageProvider`) with magic-byte validation and 5MB size limit. Document types include `NATIONAL_ID`, `VOTERS_CARD`, `DRIVERS_LICENSE`, `CAC_CERTIFICATE`, `COOPERATIVE_LETTER`, and `COMMUNITY_ATTESTATION`. Under NDPA 2023, documents are strictly private and never publicly exposed; administrators access them via short-lived signed URLs (15-min TTL) in an admin review queue (`/admin/verifications`). Submitting a document transitions participant status to `PENDING` with audit event `VERIFICATION_DOCUMENT_SUBMITTED`; admin review transitions status to `VERIFIED` or `REJECTED` (with reason note) with audit event `VERIFICATION_STATUS_CHANGED`. Profiles across all roles reflect the latest verification state.
- **DEC-029 (Feature 5.1 Crop Produce Listing Creation & Photo Capture):** Farmers create produce listings bound to Benue pilot crops (`PRODUCE_CROP_CATALOG`) and standard produce packaging units (`PRODUCE_UNIT_CATALOG`). Quality grading adopts a 3-tier system: `GRADE_A` (Premium), `GRADE_B` (Standard Market), and `GRADE_C` (Processing/Bulk). Pricing is structured in Naira (₦) per unit with a minimum order quantity (MOQ) and a `isNegotiable` boolean toggle. Stock availability supports `AVAILABLE_NOW` (harvested & ready) and `UPCOMING_HARVEST` (with estimated harvest date). Photos are uploaded to public cloud storage with client-side Canvas compression (`<= 1280px`, `<= 200 KB`), magic-byte verification, and primary image flag. Listings emit `LISTING_CREATED` and `LISTING_UPDATED` audit log entries.
- **DEC-030 (Feature 5.2 Marketplace Discovery, Filtering & Listing Detail View):**
  - **Discovery & Filtering:** Structured facet bar featuring Benue crop chips, Benue LGA selector, produce quality grade selector (`GRADE_A`, `GRADE_B`, `GRADE_C`), availability filter (`AVAILABLE_NOW`, `UPCOMING_HARVEST`), and sort order (newest, lowest price, highest quantity). Optimized for 2G/3G mobile networks without free-text search lag or ambiguous queries.
  - **Listing Detail & Dual CTAs:** Detail view displays structured produce attributes (packaging unit, price per unit, MOQ, estimated total weight in kg, perishable badge, farmer name, Benue LGA location, and seller verification status). Provides dual CTAs: direct "Call Farmer" (`tel:` click-to-call link) and primary "Start Purchase / Make Offer" entry point leading into the Phase 6 order flow.
  - **Adaptive Low-Data Photo Display:** Automatically renders optimized compressed image preview, respecting user's Low-Data Mode preference with an explicit tap-to-expand / load full resolution control.
- **DEC-031 (Feature 6.1 Commercial Purchase Enquiry Initiation & Structured Counter-Offers):**
  - **Differentiated Expiry:** Purchase offers have an automatic expiration window: strictly **24 hours** for perishable crops (`tomatoes`, `pepper`, `mangoes`, `cassava`) and **72 hours** for non-perishable staples (`yam`, `rice`, `maize`, `soybeans`, `cashew`). Unanswered offers transition to `EXPIRED` status automatically.
  - **Structured Negotiation Bounds:** Negotiation supports structured counter-offers up to **3 rounds** per party (initial offer + up to 3 counters per side). Beyond 3 rounds, parties must either accept the latest terms or decline, preventing protracted haggling on perishable produce.
  - **Fulfillment & Logistics Choice:** Offer creation captures explicit fulfillment mode: `BUYER_ARRANGES_PICKUP` (farm-gate collection in Benue LGA), `FARMER_ARRANGES_DELIVERY` (delivered to buyer destination), or `TONGRIC_LOGISTICS_REQUEST` (requests carrier quote from registered transport providers, bridging into Phase 7).
  - **No Custody / Direct Commercial Agreement:** Acceptance of an offer locks agreed terms (unit price, total quantity, total amount, delivery mode, inspection window) into an agreed Order Contract without platform fund custody in Release 1.
- **DEC-032 (Feature 6.2 Atomic Order Creation, Inventory Reservation & Concurrency Guards):**
  - **Atomic Transaction & Row Locking:** Accepting an offer executes inside a PostgreSQL transaction utilizing `SELECT ... FOR UPDATE` row-level locking on `ProduceListing`. This prevents overselling or race conditions when multiple buyers concurrently attempt to purchase remaining lot quantities.
  - **Direct Inventory Decrement & Status Transition:** Upon acceptance, the listing's available `quantity` is atomically decremented by the accepted order quantity. If remaining `quantity === 0`, the listing status transitions automatically to `SOLD_OUT`.
  - **Auto-Decline of Exceeding Competing Offers:** Any other active `PENDING` or `COUNTERED` offers on the same listing whose requested quantity exceeds the newly remaining available inventory are automatically transitioned to `DECLINED` by the system with an explanatory note (`"Auto-declined: listing inventory no longer sufficient for requested quantity"`), releasing unfulfillable negotiations immediately.
  - **Order Code Standard & Audited Milestones:** Orders receive a human-readable identifier `ORD-YYYYMM-XXXXX` (e.g. `ORD-202611-73921`) with Crockford-safe digits optimized for low-bandwidth SMS and verbal coordination over phone calls. An immutable `order_status_events` audit trail records the initial transition (`null -> CONFIRMED`) with actor ID, agreed payment disclosure note ("Direct settlement between Buyer and Farmer; zero platform fund custody"), and timestamp.
- **DEC-033 (Feature 6.3 Order Lifecycle Milestones, Pre-Collection Cancellation & Dispute Review):**
  - **Pre-Collection Cancellation Window & Mandatory Reason:** Both the Buyer and Farmer have equal authority to cancel an active order prior to collection (while status is `CONFIRMED` or `TRANSPORT_REQUESTED`). A mandatory cancellation reason note (minimum 5 characters) is required, recording who cancelled and why. Once goods have been `COLLECTED` or entered `IN_TRANSIT`, direct cancellation is locked to protect logistics and in-transit goods.
  - **Atomic Inventory Restoration & Relisting:** When an order is cancelled before collection, a PostgreSQL transaction atomically adds the order's quantity back to the `ProduceListing.quantity`. If the listing's status is `SOLD_OUT`, it automatically reverts to `ACTIVE`, restoring marketplace discoverability without requiring the farmer to manually re-create the listing.
  - **Zero-Custody Dispute Initiation & Admin Review Queue:** Either the Buyer or Farmer can transition an order to `DISPUTED` at any milestone before completion (e.g., inspection failure, quality mismatch with Grade A/B/C, transit damage, or off-platform payment dispute). Flagging a dispute requires a descriptive reason, halts normal milestone progression, records an `OrderStatusEvent`, and flags the order in the administrative console for operator telephone mediation and resolution under Section 19 rules.
  - **Milestone State Machine & Direct Confirmation:** For self-arranged fulfillment (`BUYER_ARRANGES_PICKUP`, `FARMER_ARRANGES_DELIVERY`), parties can transition milestones forward: `CONFIRMED` -> `COLLECTED` -> `DELIVERED` -> `COMPLETED`. The Buyer explicitly confirms completion after physical inspection and direct settlement. Every transition records an immutable `OrderStatusEvent` with actor ID, timestamp, and optional remarks.
