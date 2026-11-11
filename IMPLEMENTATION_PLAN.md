# TONGRIC MVP — 10-PHASE IMPLEMENTATION PLAN

**Primary Source of Truth:** [product-concept.md](reference-docs/product-concept.md)  
**Target Pilot:** Benue State, Nigeria (perishable produce priority: tomatoes, pepper, mangoes, plus locally relevant staples)  
**Core Stack:** Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM  
**Status:** Draft Roadmap — Pending Product Owner Review & Approval

---

## Executive Summary & Scope Alignment

### Core MVP Goal (Concept Doc Sections 3.2, 11, 20)
Prove one end-to-end agricultural transaction reliably on low-end mobile devices under weak Nigerian rural connectivity:
> **Farmer lists produce → Buyer discovers produce → Both parties negotiate & agree → Order created (quantity reserved) → Transportation arranged → Delivery milestones updated → Buyer confirms receipt.**

### Scope Reconciliation (Concept Doc vs. Master Prompt)
`reference-docs/product-concept.md` (Section 20) classifies **Farmer Barter** and **Financing Integrations** as *Second Release*, whereas the Project Owner's Master Prompt prioritizes including **Farmer-to-Farmer Barter** and a **Simple Loan Workflow Demonstration** within the broader MVP roadmap.

To protect the core produce-to-delivery workflow from delays while honouring all requested MVP capabilities:
- **Phases 1–8** deliver the essential core marketplace, logistics coordination, multilingual framework, notifications, and administration console.
- **Phase 9** implements **Farmer-to-Farmer Barter** and the **Simple Loan Workflow Demonstration** as modular extensions built atop the core identity, listing, logistics, and transaction-history foundation.
- **Explicitly Excluded from First Release (Future Enhancements):** Live GPS tracking & route optimization, AI soil analysis, satellite land monitoring, live bank/lending API underwriting, unlicensed payment escrow/fund custody, voice assistant, USSD/WhatsApp bots, and full agricultural input supplier e-commerce checkout.

---

## Phase 1: Project Foundation, Design System & Core Architecture

### A. Phase Identification
- **Phase Number:** 1
- **Phase Name:** Project Foundation, Design System & Core Architecture
- **Main Objective:** Establish a clean, modular Next.js + TypeScript + Tailwind CSS monolith connected to PostgreSQL via Prisma, together with Tongric's white-and-green accessible UI design system and core infrastructure utilities.
- **Why This Phase Is Necessary:** Every subsequent feature depends on consistent database connectivity, strict server-side validation patterns, lightweight mobile-first UI primitives, and low-bandwidth/error-resilient handling. Retrofitting a design system or switching from an unvalidated prototype later creates high rework risk.
- **Relationship to Tongric Product Vision:** Directly implements Part II Section 11 (Modular development, Low-cost and low-data access) and Part III Section 16–17 (Technical Architecture).

### B. Features and Functionality
1. **Repository & Modular Monolith Setup**
   - *What it does:* Initializes Next.js App Router, strict TypeScript, ESLint, testing runner, and domain-oriented module boundaries (`auth`, `profiles`, `marketplace`, `orders`, `logistics`, `notifications`, `i18n`, `admin`).
   - *Users:* Development team (enables all user-facing features).
   - *Problem solved:* Prevents tangled code and avoids premature microservices overhead (Concept Doc Section 16).
   - *Data required:* Environment configuration schema (database URL, storage credentials, app URLs).
   - *Dependencies:* None.
2. **Database & Prisma Schema Foundation**
   - *What it does:* Configures PostgreSQL connection, Prisma client singleton, migration workflow, and base audit/timestamp conventions.
   - *Users:* System / all modules.
   - *Problem solved:* Guarantees relational integrity for inventory locking, orders, and NDPA 2023 audit logs.
   - *Data required:* `DATABASE_URL` and core schema conventions (UUID/CUID IDs, `createdAt`, `updatedAt`, soft-delete/status patterns).
   - *Dependencies:* Repository setup.
3. **Tongric Visual Design System & Mobile-First UI Kit**
   - *What it does:* Implements reusable, accessible, zero-bloat UI primitives (Button, Input, Select, Card, Badge, StatusStepper, Alert, Modal/Drawer, EmptyState, RetryBanner, AppShell) following the solid-white + multi-shade green agricultural palette, high-contrast typography, and large tap targets (min 44x44px) for low-end Android screens.
   - *Users:* Farmers, Buyers, Transport Providers, Administrators.
   - *Problem solved:* Ensures consistent usability across users with limited digital literacy (Concept Doc Sections 2.6, 4.3, 15).
   - *Dependencies:* Tailwind CSS configuration.
4. **Connectivity Resilience & File Storage Abstraction**
   - *What it does:* Provides network-state detection banner (offline/slow warning), idempotent form submission wrapper with retry support, and a storage adapter interface (local/dev vs. cloud S3-compatible object storage with signed URLs for private docs).
   - *Users:* All end users, especially rural farmers on unstable 2G/3G networks.
   - *Problem solved:* Addresses Concept Doc Section 9.3 (*"Provide clear network status; support retrying failed submissions"*) and Section 15 (*Availability*).
   - *Dependencies:* Next.js foundation.

### C. Technical Implementation
- **Frontend Components & Pages:** `src/components/ui/*` (Button, FormField, Card, Alert, NetworkStatusBanner, LoadingSkeleton, Pagination); `src/app/layout.tsx` (lightweight base shell, minimal JS bundle); `/styleguide` internal verification page (dev-only).
- **Backend Functionality:** `src/lib/db.ts` (Prisma singleton), `src/lib/env.ts` (Zod-validated environment config), `src/lib/storage/*` (pluggable object storage interface), `src/lib/api-response.ts` (standardized error/success envelope), `/api/health` endpoint verifying DB reachability.
- **Database Models & Relationships:** Initial Prisma setup + `AuditLog` base table (for system integrity from Phase 1).
- **Validation & Error Handling:** Zod validation schemas for env and API inputs; uniform error codes mapped cleanly to translatable UI error keys.
- **Security Considerations:** Security headers (`X-Content-Type-Options`, `X-Frame-Options`, CSP baseline), strict separation of client vs. server env vars, private storage bucket pattern for future KYC documents.

### D. Completion Criteria
- Next.js app builds cleanly with zero TypeScript or lint errors (`tsc --noEmit`, `npm run build`).
- PostgreSQL database connects and runs initial Prisma migration cleanly; `/api/health` returns `200 OK` with DB check passing.
- Core UI component library renders cleanly at `320px`–`1440px` viewports and passes automated contrast/accessibility checks (WCAG AA).
- Network offline/retry component visually notifies users when connectivity drops and allows safe retry without duplicate mutations.

### E. Dependencies
- **Prerequisite:** Product Owner decisions on PostgreSQL hosting (local Docker/managed Postgres), UI component library choice (e.g., headless Radix/shadcn primitives styled cleanly vs. pure Tailwind components), and file storage provider.
- **Unlocks:** All subsequent phases (2–10).

### F. Testing
- Unit tests for env validation, API response helpers, and storage adapter interfaces.
- Component/accessibility tests on core UI primitives (keyboard navigation, focus rings, disabled/loading states, 320px mobile viewport rendering).
- Integration test for `/api/health` against a test PostgreSQL instance.

### G. Estimated Effort
- **Complexity:** Low–Moderate (foundational setup).
- **Risks:** Unconfigured external DB/object storage credentials delaying cloud integration; over-engineering UI components before user flows are finalized.

### H. Scope Classification
- **Essential MVP:** Monolith setup, PostgreSQL/Prisma, White-and-green accessible UI kit, `/api/health`, storage abstraction, offline/retry feedback.
- **Important but Deferrable:** Full offline IndexedDB sync queue (keep to network indicator + form retry in v1).
- **Future Enhancement:** Native mobile wrapper / USSD gateway integration.

---

## Phase 2: Multilingual Foundation & Low-Data Accessibility Framework

### A. Phase Identification
- **Phase Number:** 2
- **Phase Name:** Multilingual Foundation & Low-Data Accessibility Framework
- **Main Objective:** Build Tongric's configurable translation management architecture, language switcher, and low-data delivery standards before domain screens are constructed.
- **Why This Phase Is Necessary:** Concept Doc Section 4.3, Module 7 (`FR-040–044`), and Section 22 identify local-language accessibility as a core differentiator. Building i18n early prevents hardcoding English strings across 30+ pages later.
- **Relationship to Tongric Product Vision:** Directly satisfies Innovation Three (Section 4.3), FR-007, FR-040–044, and Section 22 target of locally validated languages.

### B. Features and Functionality
1. **Language Configuration & Central Translation Architecture**
   - *What it does:* Defines supported languages (initially English + Benue pilot priority languages such as Tiv and Hausa/Idoma — subject to Product Owner confirmation) with structured translation namespaces, fallback to English when a key is unvalidated, and validation status flags (`DRAFT`, `REVIEWED`, `VALIDATED`).
   - *Users:* All users (consume translations); Administrators/Linguistic reviewers (manage/validate translations).
   - *Problem solved:* Prevents inaccurate automated translations of agricultural or financial terms (Concept Doc Section 4.3 line 377–379).
   - *Data required:* `Language` (code, name, nativeName, isActive, isPilotPriority), `TranslationKey` (key, namespace, languageId, text, status, reviewedBy, updatedAt).
   - *Dependencies:* Phase 1 DB & UI foundation.
2. **Onboarding & Persistent Language Selector**
   - *What it does:* Lets visitors choose their preferred language on first entry (persisted via cookie + user profile once logged in) and switch languages anytime from a clear, accessible header/menu control.
   - *Users:* Farmers, Buyers, Transport Providers, Visitors.
   - *Problem solved:* Allows non-English-fluent farmers to navigate registration and onboarding immediately (Journey A steps 1–2, FR-007, FR-041).
   - *Data required:* Cookie `tongric_locale` + `User.preferredLanguageCode`.
   - *Dependencies:* Feature 2.1.
3. **Structured Translatable Reference Catalogs & Low-Data Budget Guardrails**
   - *What it does:* Establishes pattern for translating enums, crop names, units, Benue LGAs, and order statuses via dictionary keys rather than machine-translating free text; enforces image size/compression utilities and lightweight font/asset budgets.
   - *Users:* All users.
   - *Problem solved:* Keeps page payloads small for rural 2G/3G users and avoids confusing partial translations.
   - *Dependencies:* Feature 2.1.

### C. Technical Implementation
- **Frontend Components & Pages:** `LanguageSwitcher` component, first-visit language selector modal/banner, translation hook/server helper (`getTranslator(locale)`), client-side image compression helper (canvas/browser-image-compression down to WebP/JPEG <= 200KB before upload).
- **Backend Functionality:** Cached translation loader (loads validated JSON/DB dictionaries into memory/ISR cache with revalidation on admin edit so DB isn't queried per key per request).
- **Database Models & Relationships:** `Language` 1—N `TranslationEntry` (unique `[key, namespace, languageCode]`).
- **API Endpoints / Server Actions:** `GET /api/i18n/[locale]` (cacheable), `POST /api/preferences/language` (updates cookie and DB preference if authenticated).
- **Validation & Error Handling:** Graceful fallback to English if a translation key is missing or still `DRAFT` (configurable indicator in dev/admin mode); strict locale code validation.

### D. Completion Criteria
- Users can select a language before login and switch languages dynamically across pages; choice persists across reloads.
- Missing or unvalidated translations cleanly fall back to English without runtime crashes or blank UI labels.
- Initial UI bundle and sample translated page weight stay within agreed low-data target (e.g., < 250KB initial transfer on 3G simulation).
- Client image compressor reliably shrinks a 4MB smartphone photo to <= 200KB before upload.

### E. Dependencies
- **Prerequisite:** Phase 1 complete; Product Owner confirms the 3 pilot languages for Benue State (noting Tiv and Hausa are in Concept Doc 4.3, whereas Idoma/Pidgin should be explicitly confirmed or excluded).
- **Unlocks:** Localized UI copy for Phase 3 (Auth) and all following phases.

### F. Testing
- Locale persistence test (unauthenticated cookie → authenticated profile sync).
- Fallback test (missing key / unvalidated key renders English fallback).
- Client image compression test (JPEG/PNG oversized inputs compressed cleanly, corrupted files rejected with translated error).
- Mobile 3G network throttling check in browser DevTools.

### G. Estimated Effort
- **Complexity:** Moderate (caching strategy + avoiding translation flicker + image compression on low-end Android).
- **Risks:** Native-speaker translation availability for Tiv/Hausa/other languages is an operational dependency outside engineering; incomplete keys at launch.

### H. Scope Classification
- **Essential MVP:** Central translation system, 3 pilot languages (English + 2 validated local languages), language selector, image compression, structured translatable catalogs.
- **Important but Deferrable:** Admin inline translation editing UI (can initially seed/update via structured JSON + admin import/edit in Phase 8); all 7 languages from Concept Doc 4.3.
- **Future Enhancement:** Voice-assisted local-language audio prompts, automatic user-generated listing text translation.

---

## Phase 3: Authentication, Role-Based Access Control & NDPA Consent

### A. Phase Identification
- **Phase Number:** 3
- **Phase Name:** Authentication, Role-Based Access Control & NDPA Consent
- **Main Objective:** Enable secure account registration, login, password/PIN recovery, role-based access enforcement, and Nigeria Data Protection Act 2023 (NDPA) consent capture.
- **Why This Phase Is Necessary:** All user journeys require authenticated identity, ownership enforcement, and role separation (Farmers vs. Buyers vs. Transport Providers vs. Admins).
- **Relationship to Tongric Product Vision:** Implements Module 1 (`FR-001–FR-007`), Section 12 (User Roles), and Section 27 (Regulatory & NDPA 2023 compliance).

### B. Features and Functionality
1. **User Registration with Role Selection & NDPA Consent**
   - *What it does:* Allows a user to register with phone number (primary for Nigeria) and/or email, password/PIN, name, preferred language, and account role (`FARMER`, `BUYER`, `TRANSPORT_PROVIDER`), displaying a clear localized privacy notice and capturing explicit consent (`ConsentRecord`).
   - *Users:* Prospective Farmers, Buyers, Transport Providers (Admin accounts seeded/created via privileged flow, never self-selected).
   - *Problem solved:* Onboards distinct marketplace participants safely while establishing NDPA 2023 consent compliance.
   - *Data required:* `phone` (normalized E.164 `+234...`), optional `email`, `fullName`, `passwordHash`, `role`, `preferredLanguage`, `consentVersion`, `consentedAt`.
   - *Dependencies:* Phases 1 & 2.
2. **Secure Login, Session Management & Password Reset**
   - *What it does:* Authenticates users securely via HTTP-only encrypted session cookies, handles rate-limiting against brute force, supports logout, and provides password/PIN recovery.
   - *Users:* All registered users including Admins.
   - *Problem solved:* Protects accounts from unauthorized access while keeping login simple on mobile devices.
   - *Dependencies:* Feature 3.1.
3. **Role-Based Access Control (RBAC) & Account Status Enforcement**
   - *What it does:* Protects routes, server actions, and APIs by role (`FARMER`, `BUYER`, `TRANSPORT_PROVIDER`, `ADMIN`), ownership checks, and account state (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`).
   - *Users:* System-wide enforcement across all roles.
   - *Problem solved:* Implements FR-006 and prevents buyers from editing farmer listings or unauthorized users from viewing private admin data.
   - *Dependencies:* Feature 3.2.
4. **Community Agent / Assisted Registration Support (Scope Check Required)**
   - *What it does:* Enables trusted field agents or admins (if approved) to register farmers during assisted community onboarding (Concept Doc Section 9.4) and hand over credentials safely with an audit trail.
   - *Users:* Community Agents / Admins assisting Farmers.
   - *Problem solved:* Addresses GSMA data showing only 28% rural mobile internet adoption (Section 2.6).
   - *Dependencies:* Features 3.1 & 3.3.

### C. Technical Implementation
- **Frontend Components & Pages:** `/register`, `/login`, `/forgot-password`, `/reset-password`, `/privacy` (NDPA notice), role-aware navigation wrapper, auth error/retry states.
- **Backend Functionality:** Password hashing (`argon2` or `bcryptjs`), session library (e.g., Auth.js / Lucia-style signed HTTP-only cookie or custom Iron/JWT session stored in DB for instant revocation on suspension), Nigerian phone number normalization (`080...` → `+23480...`), rate limiter on auth endpoints, `requireRole()` and `requireOwnership()` server guards.
- **Database Models & Relationships:** `User` (`id`, `phone`, `email`, `passwordHash`, `role`, `status`, `preferredLanguage`, `assistedByUserId`), `Session` (if DB-backed sessions), `PasswordResetToken`, `ConsentRecord` (`userId`, `purpose`, `policyVersion`, `grantedAt`), `AuditLog`.
- **API Endpoints / Server Actions:** `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/me`.
- **Security Considerations:** CSRF protection, HTTP-only `Secure` `SameSite=Lax` cookies, constant-time hash comparison, no user enumeration on login/forgot-password errors, immediate session invalidation when `User.status === 'SUSPENDED'`.

### D. Completion Criteria
- Farmers, Buyers, and Transport Providers can register, log in, stay signed in across refreshes, and log out; Admins cannot be self-registered publicly.
- Every protected endpoint rejects unauthenticated (`401`) and wrong-role (`403`) requests; suspended users are blocked immediately.
- NDPA consent record with timestamp and policy version is stored on registration.
- Forgotten password/PIN reset flow works end-to-end according to the chosen channel (SMS OTP / email / admin-assisted reset).

### E. Dependencies
- **Prerequisite:** Phases 1 & 2; Product Owner decisions on auth identifier (Phone-first vs. Email), Password reset delivery mechanism (SMS cost implications vs. email vs. recovery code/agent reset), and whether Community Agent is a formal Phase 3 role.
- **Unlocks:** Profile management (Phase 4) and all role-specific features (Phases 5–9).

### F. Testing
- Auth happy paths for each role + Nigerian phone format edge cases (`0803...`, `+234803...`, invalid digits).
- Negative tests: duplicate phone/email registration, invalid password, expired reset token, brute-force rate limit trigger, `403 Forbidden` cross-role access attempts, suspended account rejection.
- Consent validation test: registration blocked if NDPA privacy consent is unchecked.

### G. Estimated Effort
- **Complexity:** Moderate.
- **Risks:** SMS OTP provider costs/Sender ID approval in Nigeria if OTP is chosen for MVP login/reset; UX friction if rural farmers forget complex passwords.

### H. Scope Classification
- **Essential MVP:** Registration, Role selection, Login/Logout, RBAC, NDPA consent capture, Basic password/PIN reset.
- **Important but Deferrable:** Dedicated Community Agent portal (can start with Admin-assisted flag on registration until field workflow is clarified); Multi-factor authentication (2FA).
- **Future Enhancement:** USSD registration, biometric/voice login, NIN/BVN automated identity API verification.

---

## Phase 4: Participant Profiles, Reference Data & Verification Workflow

### A. Phase Identification
- **Phase Number:** 4
- **Phase Name:** Participant Profiles, Reference Data & Verification Workflow
- **Main Objective:** Implement role-specific profiles for Farmers, Buyers, and Transport Providers, standardized Benue location and agricultural crop/unit catalogs, and a secure verification submission and admin review workflow.
- **Why This Phase Is Necessary:** Listings, search filtering, and logistics matching depend on structured locations (LGAs/markets), crop categories, units, and verified participant identities. Placing minimal admin verification review here avoids blocking verification-aware marketplace trust indicators in Phases 5–7.
- **Relationship to Tongric Product Vision:** Implements Module 2 (`FR-008–FR-012`), Logistics profile setup (`FR-027–FR-028`), Section 7 (Benue pilot crop/geography focus), and Section 9.5 (Trust and verification).

### B. Features and Functionality
1. **Farmer, Buyer & Transport Provider Profiles**
   - *What it does:* Lets each user complete their role-specific profile:
     - **Farmer (`FR-008`, `FR-010`):** Farm location (State/LGA/community), primary crops, cooperative/association affiliation (optional), preferred contact method.
     - **Buyer (`FR-009`, `FR-010`):** Business/organization name, buyer type (processor, wholesaler, retailer, restaurant/hotel, institutional), operating location, crops typically sourced.
     - **Transport Provider (`FR-027`, `FR-028`, `Section 4.2`):** Business or operator name, vehicle type(s) (motorcycle/tricycle, pickup, van, truck), carrying capacity (in kg/tonnes), operating LGAs/routes, availability toggle, pricing model preference (fixed rate card vs. quote-on-request), contact details.
   - *Users:* Farmers, Buyers, Transport Providers.
   - *Problem solved:* Establishes trustworthy participant context before commercial offers or deliveries begin.
   - *Dependencies:* Phase 3 Authentication & RBAC.
2. **Structured Benue Geography & Crop/Unit Reference Catalogs**
   - *What it does:* Provides standardized, translatable dropdowns for Nigerian States/Benue LGAs & major markets, priority crop categories (tomatoes, pepper, mangoes, cassava, yam, maize, rice, soybeans), and local agricultural units (`kg`, `bag`, `basket`, `crate`, `tonne`, `unit`) with optional estimated kg-per-unit conversion for logistics capacity calculation.
   - *Users:* All marketplace participants and Admins.
   - *Problem solved:* Eliminates misspelled locations/crops in search and enables reliable multi-language display + vehicle capacity matching.
   - *Dependencies:* Phase 2 i18n framework.
3. **Verification Document Submission & Minimal Admin Review**
   - *What it does:* Allows Farmers, Buyers, and Transport Providers (highest priority for Buyers and Transporters) to upload verification details/documents (e.g., cooperative ID, CAC/business registration, driver's licence/vehicle registration) into private storage. Admins can view queued submissions via short-lived signed URLs and approve or reject with a reason.
   - *Users:* Farmers, Buyers, Transport Providers, Administrators.
   - *Problem solved:* Implements Section 4.6/9.5 (*"Verification will be based on documented checks, not merely account registration"*) and mitigates fraud risk (Section 26).
   - *Dependencies:* Feature 4.1 and Phase 1 private storage adapter.

### C. Technical Implementation
- **Frontend Components & Pages:** `/profile` (role-specific form + completeness indicator), `/profile/verification` (upload status & instructions), `/admin/verifications` (minimal queue for reviewing KYC docs and toggling `UNVERIFIED | PENDING | VERIFIED | REJECTED`).
- **Backend Functionality:** Profile CRUD services, private document upload presign/upload handler, short-lived signed URL generator for Admin review only, `AuditLog` writer for every verification decision.
- **Database Models & Relationships:** `Location` (state, lga, town/market), `CropCategory`, `FarmerProfile`, `BuyerProfile`, `TransportProfile`, `Vehicle` (1—N under `TransportProfile`), `VerificationRequest` (`userId`, `status`, `documentKeys[]`, `submittedAt`, `reviewedById`, `reviewNote`).
- **API Endpoints / Server Actions:** `GET/PUT /api/profiles/me`, `GET /api/catalog/locations`, `GET /api/catalog/crops`, `POST /api/verifications`, `GET /api/admin/verifications`, `PATCH /api/admin/verifications/[id]`.
- **Security Considerations:** Private object storage (zero public URLs for IDs/licences); strict MIME-type and file-size validation; only document owner and `ADMIN` can request signed download links; phone numbers masked on public profiles until active transaction engagement if desired (pending Product Owner rule).

### D. Completion Criteria
- Farmers, Buyers, and Transport Providers can create and edit their profiles on mobile (`320px`+) and desktop.
- Verification documents upload privately, are inaccessible via direct unauthenticated URLs, and can be reviewed/approved/rejected by an Admin with an `AuditLog` entry recorded.
- Verification badge accurately updates on user profile after Admin approval.

### E. Dependencies
- **Prerequisite:** Phases 1–3; Product Owner confirms required verification rules (e.g., can unverified farmers list produce, or are unverified buyers/transporters restricted?) and Benue priority crops/LGAs.
- **Unlocks:** Produce listings (Phase 5) and Logistics search/requests (Phase 7).

### F. Testing
- Profile creation and validation tests per role (capacity > 0, valid Benue LGA selection).
- Security test: non-admin user blocked (`403`) from listing or reviewing other users' verification documents; direct unauthenticated document access denied.
- File upload edge cases: oversized document (> 5MB), invalid file type (`.exe`/`.html`), network drop retry.

### G. Estimated Effort
- **Complexity:** Moderate.
- **Risks:** Unclear verification requirements for smallholder farmers who lack formal IDs (cooperative attestation vs. government ID must be clarified in Product Decisions).

### H. Scope Classification
- **Essential MVP:** Farmer, Buyer, and Transport Provider profiles; Benue LGA/crop catalogs; Verification submission + Admin review queue.
- **Important but Deferrable:** Existing storage & aggregation facility directory (Concept Doc Section 4.2 line 334); multiple vehicles per driver if single vehicle suffices initially.
- **Future Enhancement:** Automated NIN/CAC verification APIs, `SupplierProfile` (deferred with Input Marketplace).

---

## Phase 5: Produce Marketplace — Listings & Buyer Discovery

### A. Phase Identification
- **Phase Number:** 5
- **Phase Name:** Produce Marketplace — Listings & Buyer Discovery
- **Main Objective:** Enable Farmers to publish, edit, and manage produce listings with compressed photos, and enable Buyers to search, filter, and inspect available produce.
- **Why This Phase Is Necessary:** Without accurate, discoverable supply listings tailored to perishable crops and low-bandwidth phones, buyers cannot find farmers to initiate negotiations.
- **Relationship to Tongric Product Vision:** Implements Module 3 (`FR-013–FR-018`), Section 4.1 (Innovation One), Journey A (steps 5–9), and Journey B (steps 3–5).

### B. Features and Functionality
1. **Create, Edit & Deactivate Produce Listings (`FR-013–FR-016`)**
   - *What it does:* Farmers enter crop category, optional variety/grade, available quantity + unit (with optional estimated kg per unit), asking price per unit (or "Negotiable"), harvest/availability window, farm/collection LGA & location, quality notes, preferred collection/delivery arrangement, and up to N compressed produce photographs. Farmers can edit quantities/prices, mark as sold out, or deactivate listings.
   - *Users:* Farmers (and Admins/Agents if assisted mode is enabled).
   - *Problem solved:* Replaces word-of-mouth market discovery with structured, comparable produce availability.
   - *Data required:* `ProduceListing` (`farmerId`, `cropId`, `title`, `totalQuantity`, `availableQuantity`, `unit`, `estimatedKgPerUnit`, `pricePerUnitNgn`, `isPriceNegotiable`, `locationId`, `harvestDate`, `availableUntil`, `qualityDescription`, `isPerishable`, `status`), `ListingImage[]`.
   - *Dependencies:* Phases 2 (image compression + i18n) and 4 (Farmer profile + catalogs).
2. **Buyer Produce Search & Multi-Criteria Filtering (`FR-017`, `FR-018`)**
   - *What it does:* Provides a fast, lightweight marketplace feed with search and filters for crop type, State/LGA location, minimum available quantity, price range, availability date, perishability/harvest freshness, and farmer verification status, plus clear sort options (newest, price low-high, soonest available).
   - *Users:* Buyers (and public/logged-in Farmers checking market visibility — configurable).
   - *Problem solved:* Allows food processors, wholesalers, and retailers in Makurdi or beyond to rapidly locate sufficient supply without calling dozens of local intermediaries.
   - *Dependencies:* Feature 5.1.
3. **Listing Detail View & Availability Integrity Display**
   - *What it does:* Shows complete produce details, farmer profile summary & verification badge, remaining `availableQuantity` vs `reservedQuantity`, photo thumbnails with tap-to-enlarge (lazy-loaded to save mobile data), and clear primary CTA to enquire or make an offer.
   - *Users:* Buyers, Farmers.
   - *Problem solved:* Gives buyers the exact information needed before committing to an offer (Concept Doc Section 23 Buyer Research).
   - *Dependencies:* Feature 5.2.

### C. Technical Implementation
- **Frontend Components & Pages:** `/marketplace` (search & filter bar, lightweight listing cards with tiny thumbnails, pagination/load-more), `/marketplace/[id]` (listing detail), `/farmer/listings` (my listings dashboard with status tabs), `/farmer/listings/new` and `/farmer/listings/[id]/edit` (step-by-step mobile-friendly form).
- **Backend Functionality:** Listing CRUD with ownership check, server-side automatic expiry/out-of-stock status guards, PostgreSQL indexed filtering (`cropId`, `locationId`, `status`, `availableQuantity`, `pricePerUnitNgn`), image upload orchestration.
- **Database Models & Relationships:** `ProduceListing` (`availableQuantity` + `reservedQuantity` Decimal/Numeric fields, `status: DRAFT | ACTIVE | PAUSED | SOLD_OUT | EXPIRED | REMOVED`), `ListingImage` (`listingId`, `storageKey`, `sortOrder`).
- **API Endpoints / Server Actions:** `GET /api/listings`, `GET /api/listings/[id]`, `POST /api/listings`, `PATCH /api/listings/[id]`, `DELETE /api/listings/[id]` (soft-deactivate).
- **Validation & Error Handling:** Prevent negative quantities or prices; prevent editing `totalQuantity` below already `reservedQuantity`; reject expired availability dates on creation; enforce max photo count/size.

### D. Completion Criteria
- A Farmer can create a listing with a compressed photo on a mobile viewport in minimal steps, edit its price/quantity, and pause/deactivate it.
- A Buyer can search and filter active listings accurately by crop, LGA, minimum quantity, price range, and verification status.
- Inactive, expired, or `availableQuantity === 0` listings do not appear as purchasable in default buyer search results.

### E. Dependencies
- **Prerequisite:** Phases 1–4.
- **Unlocks:** Enquiries, Offers, and Order Creation (Phase 6).

### F. Testing
- Listing CRUD ownership & validation tests (cannot edit another farmer's listing; cannot set negative quantity or price).
- Search/filter query accuracy tests (combining crop + LGA + min quantity + price ceiling).
- Image upload & compression tests (ensure payload <= 200KB per image and placeholder fallback when farmer uploads 0 photos).
- Pagination & empty-state UI tests when no listings match filters.

### G. Estimated Effort
- **Complexity:** Moderate.
- **Risks:** Free-text descriptions will not auto-translate across languages (mitigated by structured crop/unit/grade dropdowns); slow mobile rendering if images aren't resized/lazy-loaded.

### H. Scope Classification
- **Essential MVP:** Farmer listing CRUD, compressed photos, Buyer search/filters, Listing detail view.
- **Important but Deferrable:** Saved searches/watchlists, price trend hints, CSV/bulk upload for cooperatives.
- **Future Enhancement:** AI image quality grading, satellite farm-location map pins on listings.

---

## Phase 6: Enquiries, Offers, Negotiation & Order Management

### A. Phase Identification
- **Phase Number:** 6
- **Phase Name:** Enquiries, Offers, Negotiation & Order Management
- **Main Objective:** Implement the commercial negotiation workflow (enquiries, structured offers/counter-offers) and atomic Order creation with strict produce quantity reservation and lifecycle tracking.
- **Why This Phase Is Necessary:** Concept Doc Section 18 stresses that Tongric must separate enquiries, offers, agreements, and completed orders while preventing overselling (double-selling the same produce quantity to two buyers).
- **Relationship to Tongric Product Vision:** Implements Module 3 (`FR-019–FR-021`), Module 4 (`FR-022–FR-026`), Section 18 (Order Logic & Transaction Integrity), and Section 19 (Payment Strategy).

### B. Features and Functionality
1. **Buyer-Farmer Enquiries (Structured Q&A Thread)**
   - *What it does:* Allows a Buyer to send pre-offer questions about a listing (e.g., harvest readiness, packaging, viewing sample) and Farmers to reply in-app without leaking contact details prematurely if configured, or alongside optional direct phone reveal rules.
   - *Users:* Buyers, Farmers.
   - *Problem solved:* Supports `FR-019` and Section 18's distinction between an enquiry and a binding offer.
   - *Dependencies:* Phase 5.
2. **Offers & Counter-Offer Negotiation Workflow**
   - *What it does:* Buyers submit a structured Offer on a listing (requested quantity, proposed price per unit, desired collection/delivery date, payment arrangement note, optional expiry). Farmers can Accept, Reject, or Counter-Offer (changing price/quantity); Buyers can accept or reject counter-offers. Full negotiation history is preserved.
   - *Users:* Buyers, Farmers.
   - *Problem solved:* Mirrors real agricultural bargaining transparently and creates an immutable record of what was agreed (`FR-019`, `FR-020`, `FR-026`).
   - *Dependencies:* Feature 6.1.
3. **Atomic Order Creation & Produce Quantity Reservation (`FR-021`, `Section 18`)**
   - *What it does:* When a Farmer accepts a Buyer's offer (or Buyer accepts a Farmer's counter-offer), the system atomically creates an `Order` in `CONFIRMED` status inside a database transaction, checks `listing.availableQuantity >= offer.quantity`, decrements `availableQuantity`, and increments `reservedQuantity`. If remaining `availableQuantity === 0`, the listing automatically switches to `SOLD_OUT`.
   - *Users:* Farmers, Buyers.
   - *Problem solved:* Prevents overselling (Section 18: *"A farmer should not accidentally have the same quantity sold to multiple buyers"*).
   - *Dependencies:* Feature 6.2.
4. **Order Lifecycle, Cancellation & Payment Disclosure (`FR-022–FR-026`, `Section 19`)**
   - *What it does:* Displays active and past orders (`CONFIRMED → TRANSPORT_REQUESTED → TRANSPORT_ASSIGNED → COLLECTED → IN_TRANSIT → DELIVERED → COMPLETED`, plus `CANCELLED` and `DISPUTED`), records every status transition with actor and timestamp (`OrderStatusEvent`), handles pre-collection cancellation (releasing reserved quantity back to listing `availableQuantity` if listing is still active), and clearly displays the direct payment arrangement & zero-custody disclosure (Section 19).
   - *Users:* Buyers, Farmers (plus Transport status hooks in Phase 7 and Admin dispute review in Phase 8).
   - *Problem solved:* Creates verifiable digital transaction history (`FR-025`) needed later for trust and optional loan underwriting consent.
   - *Dependencies:* Feature 6.3.
5. **Buyer Purchase Requests / Reverse RFQs (Scope Verification Needed)**
   - *What it does:* Allows verified Buyers to post what crop, quantity, and price range they want to buy so Farmers can respond (mentioned in Concept Doc Section 4.1 line 257 & Section 12.2 line 857).
   - *Users:* Buyers, Farmers.
   - *Problem solved:* Helps large processors source aggregate quantities when single smallholders have smaller lots.
   - *Dependencies:* Phase 5 catalogs.

### C. Technical Implementation
- **Frontend Components & Pages:** Offer modal/form on `/marketplace/[id]`, `/enquiries` or `/negotiations/[id]` thread view, `/orders` list + `/orders/[id]` detail page featuring visual order timeline stepper, payment disclosure box, and action buttons (Request Transport / Mark Self-Pickup / Cancel / Dispute).
- **Backend Functionality:** Transactional order-acceptance service using Prisma `$transaction` with optimistic version check or PostgreSQL row-level locking (`SELECT ... FOR UPDATE` on `ProduceListing`) to ensure zero race conditions on concurrent offer acceptance.
- **Database Models & Relationships:** `EnquiryThread`, `EnquiryMessage`, `Offer` (`listingId`, `buyerId`, `status: PENDING | COUNTERED | ACCEPTED | REJECTED | EXPIRED | WITHDRAWN`, `proposedQty`, `proposedUnitPrice`, `expiresAt`), `OfferRevision` (negotiation trail), `Order` (`orderCode`, `listingId`, `offerId`, `farmerId`, `buyerId`, `quantity`, `unitPriceNgn`, `totalAmountNgn`, `fulfilmentMode`, `paymentArrangementNote`, `status`), `OrderStatusEvent` (`orderId`, `fromStatus`, `toStatus`, `changedById`, `note`, `createdAt`).
- **API Endpoints / Server Actions:** `POST /api/listings/[id]/enquiries`, `POST /api/listings/[id]/offers`, `PATCH /api/offers/[id]/respond` (accept/reject/counter/withdraw), `GET /api/orders`, `GET /api/orders/[id]`, `POST /api/orders/[id]/cancel`, `POST /api/orders/[id]/dispute`.
- **Security & Validation:** Only listing owner (`FARMER`) can accept a buyer's initial offer; only the non-proposing party can accept the latest counter-offer; cannot accept an offer whose quantity exceeds `availableQuantity` or whose listing is paused/expired; prevent self-dealing (same user buying own listing).

### D. Completion Criteria
- Buyer and Farmer can exchange enquiries, negotiate via offer/counter-offer, and see complete negotiation history.
- Accepting an offer atomically creates an `Order` and reduces `ProduceListing.availableQuantity` without ever allowing negative inventory, even under simultaneous concurrent acceptances.
- Cancelling a `CONFIRMED` order prior to collection restores `availableQuantity` properly and records an `OrderStatusEvent`.
- Order detail page clearly communicates off-platform payment terms (no escrow/fund custody in Release 1).

### E. Dependencies
- **Prerequisite:** Phases 1–5; Product Owner confirms offer expiry defaults, cancellation cutoff rules, and whether Buyer Purchase Requests (RFQs) belong in Release 1 or Phase 9/later.
- **Unlocks:** Logistics Coordination (Phase 7) and Transaction History for Loan Workflow Demo (Phase 9).

### F. Testing
- **Concurrency test (critical):** Simulate two parallel offer-acceptance requests on a `500kg` listing (each for `300kg`); assert exactly one succeeds (`CONFIRMED`, `200kg` remaining) and the second fails cleanly with insufficient quantity error.
- State-machine transition tests (invalid transitions rejected; counter-offer turn-taking enforced; cannot cancel after `IN_TRANSIT`).
- Cancellation rollback test verifying `availableQuantity` restoration and `SOLD_OUT → ACTIVE` transition where appropriate.

### G. Estimated Effort
- **Complexity:** High (concurrency locking, strict state machine, multi-party turn-based negotiation UX kept simple enough for low-literacy mobile users).
- **Risks:** Off-platform payment disputes if users expect Tongric to hold/refund money; buyers leaving stale offers open on perishable goods unless expiry is enforced.

### H. Scope Classification
- **Essential MVP:** Enquiries, Offers & Counter-offers, Atomic Order creation & inventory reservation, Order lifecycle & history, Off-platform payment disclosure.
- **Important but Deferrable:** Buyer Purchase Requests / Open RFQs (can be deferred to after core produce listing → order loop is proven, unless Product Owner prioritizes them for institutional buyers).
- **Future Enhancement:** Licensed payment gateway checkout / compliant third-party escrow, automated platform fee invoicing.

---

## Phase 7: Integrated Logistics Coordination, Delivery Milestones & Reviews

### A. Phase Identification
- **Phase Number:** 7
- **Phase Name:** Integrated Logistics Coordination, Delivery Milestones & Reviews
- **Main Objective:** Connect confirmed agricultural orders directly with Transport Providers via requests, quotations, linked delivery records, 6-step milestone updates, buyer delivery confirmation, and post-transaction reviews.
- **Why This Phase Is Necessary:** Concept Doc Section 2.4 & Section 32 emphasize that buyer discovery alone fails perishable farmers unless delivery is coordinated end-to-end inside the same workflow.
- **Relationship to Tongric Product Vision:** Implements Innovation Two (Section 4.2), Module 5 (`FR-027–FR-034`), Journey C, Section 17 (`TransportRequests`, `TransportQuotes`, `Deliveries`, `Reviews`), and Section 20.

### B. Features and Functionality
1. **Transport Provider Search & Capacity Matching (`FR-029`)**
   - *What it does:* Matches confirmed orders (origin LGA + destination LGA + estimated shipment kg) against active Transport Providers whose operating routes and vehicle capacity can carry the load.
   - *Users:* Buyers, Farmers.
   - *Problem solved:* Eliminates time wasted calling unsuitable or unavailable transporters while crops deteriorate.
   - *Dependencies:* Phases 4 (Transport profiles & vehicles) and 6 (Confirmed orders).
2. **Transport Request, Quotation & Booking Confirmation (`FR-030`, `FR-031`)**
   - *What it does:* Allows the designated party (or either party subject to single-active-request guard) to create a `TransportRequest` for an order (or mark `SELF_PICKUP` where buyer arranges own collection). Targeted or matching providers submit a `TransportQuote` (quoted fee, pickup window, vehicle assigned, notes) or accept/reject a direct request. Accepting a quote creates an official `Delivery` linked to the `Order`.
   - *Users:* Buyers, Farmers, Transport Providers.
   - *Problem solved:* Provides transparent transport pricing comparison before dispatch (Concept Doc Section 2.4 & 4.2).
   - *Dependencies:* Feature 7.1.
3. **6-Step Delivery Milestone Tracking & Buyer Confirmation (`FR-032`, `FR-033`, `FR-034`)**
   - *What it does:* Tracks physical movement cleanly through Section 4.2's milestones: `TRANSPORT_REQUESTED → PROVIDER_CONFIRMED → PRODUCE_COLLECTED → SHIPMENT_DISPATCHED → PRODUCE_DELIVERED → BUYER_CONFIRMED_RECEIPT`. Transport Providers update collection/dispatch/delivery timestamps (and optional dispatch note); Buyers confirm receipt (which marks the linked `Order` `COMPLETED`).
   - *Users:* Transport Providers (update transit milestones), Buyers (confirm receipt), Farmers (monitor progress).
   - *Problem solved:* Gives farmers visibility that produce reached the buyer safely and builds verifiable delivery records (`Section 4.2`, `Section 24`).
   - *Dependencies:* Feature 7.2.
4. **Post-Transaction Reviews (`Section 9.5`, `Section 12.2`, `Section 17`)**
   - *What it does:* After an order reaches `COMPLETED`, Buyer, Farmer, and Transport Provider can submit a concise rating (1–5) and brief feedback on reliability/quality/timeliness.
   - *Users:* Buyers, Farmers, Transport Providers.
   - *Problem solved:* Improves marketplace accountability without complex reputation algorithms.
   - *Dependencies:* Feature 7.3.

### C. Technical Implementation
- **Frontend Components & Pages:** `/orders/[id]/logistics` (provider search, request form, quote comparison cards, self-pickup toggle), `/transport/requests` (provider job board & active deliveries), `/transport/deliveries/[id]` (large mobile-friendly milestone update buttons with confirmation step), Delivery timeline UI embedded in `/orders/[id]`, Review submission card on completed orders.
- **Backend Functionality:** Capacity-matching query service, transactional quote acceptance (cancels competing pending quotes for that request, creates `Delivery`, transitions `Order` to `TRANSPORT_ASSIGNED`), milestone state-machine guard enforcing role authority per step (`TRANSPORT_PROVIDER` for collection/dispatch/delivered; `BUYER` for receipt confirmation).
- **Database Models & Relationships:** `TransportRequest` (`orderId`, `requestedByUserId`, `originLocationId`, `destinationLocationId`, `estimatedWeightKg`, `preferredPickupDate`, `status`), `TransportQuote` (`requestId`, `providerId`, `vehicleId`, `quotedAmountNgn`, `estimatedHours`, `status`), `Delivery` (`requestId`, `orderId`, `quoteId`, `providerId`, `milestone`, `collectedAt`, `dispatchedAt`, `deliveredAt`, `buyerConfirmedAt`), `Review` (`orderId`, `reviewerId`, `subjectUserId`, `rating`, `comment`).
- **API Endpoints / Server Actions:** `GET /api/transport/providers`, `POST /api/orders/[id]/transport-request`, `POST /api/transport-requests/[id]/quotes`, `POST /api/transport-quotes/[id]/accept`, `PATCH /api/deliveries/[id]/milestone`, `POST /api/orders/[id]/confirm-receipt`, `POST /api/orders/[id]/reviews`.
- **Validation & Error Handling:** Prevent duplicate open `TransportRequest` on the same order; block quote submission from unverified or suspended transport providers (per verification rules); prevent backward milestone transitions.

### D. Completion Criteria
- A Buyer or Farmer can find matching transport providers, request logistics, compare quotes, and accept one (or select self-pickup).
- Transport Provider can update milestones through `PRODUCE_DELIVERED`, and Buyer can confirm receipt to complete the order.
- Invalid role actions (e.g., Farmer trying to mark `BUYER_CONFIRMED_RECEIPT`, or Transport Provider skipping collection/updating another driver's delivery) are rejected with `403`.
- Completed transactions allow submitting one verified review per participant pair.

### E. Dependencies
- **Prerequisite:** Phases 1–6; Product Owner resolves transport flow questions (who initiates/pays for transport, quote-bidding vs. direct booking, and whether verification is mandatory before Transport Providers can quote).
- **Unlocks:** Complete end-to-end core MVP workflow; Admin delivery monitoring & notifications (Phase 8).

### F. Testing
- Full multi-role integration test: Farmer lists → Buyer orders → Transport Provider quotes → Buyer/Farmer accepts quote → Provider marks Collected → Dispatched → Delivered → Buyer confirms receipt → Reviews posted.
- Self-pickup workflow test (Order completes without requiring a `TransportQuote`).
- Concurrency/state tests: accepting one quote rejects other quotes on the same request; double-confirmation rejected idempotently.

### G. Estimated Effort
- **Complexity:** High (multi-actor coordination across 3 roles + strict state transitions).
- **Risks:** Ambiguity around who pays the transport fee off-platform (must display clearly on quote acceptance); low smartphone usage among rural drivers during transit (UI must use 1-tap large milestone buttons).

### H. Scope Classification
- **Essential MVP:** Provider search, transport requests, quotes/acceptance, 6-step milestone tracking, buyer confirmation, self-pickup option.
- **Important but Deferrable:** Post-transaction reviews (can ship right after milestone tracking if time-constrained), route map visualization.
- **Future Enhancement:** Live GPS location tracking, automated route optimization, dispatch telematics.

---

## Phase 8: Notifications & Administration Console

### A. Phase Identification
- **Phase Number:** 8
- **Phase Name:** Notifications & Administration Console
- **Main Objective:** Deliver timely, localized transaction notifications across key workflow events and build the complete Administrator Console for moderation, dispute handling, account governance, pilot metrics, and translation management.
- **Why This Phase Is Necessary:** Without proactive notifications, rural farmers and busy buyers miss offers or delivery updates; without admin tools, fraudulent listings, disputes, and unvalidated translations cannot be governed safely during the Benue pilot.
- **Relationship to Tongric Product Vision:** Implements Module 6 (`FR-035–FR-039`), Module 7 Admin (`FR-044`), Module 8 (`FR-045–FR-050`), Section 12.5, and Section 24 (Operational pilot metrics).

### B. Features and Functionality
1. **Localized In-App Notifications & External Channel Boundary (`FR-035–FR-039`, `FR-043`)**
   - *What it does:* Generates persistent notifications in the user's preferred language for key events: new enquiry, new/countered offer, offer accepted/order confirmed, transport request/quote received, delivery milestones, verification decision, and loan application updates (in Phase 9). Routes through a modular `NotificationService` supporting in-app feed + pluggable email/SMS providers (only enabled when credentials/approval are configured).
   - *Users:* Farmers, Buyers, Transport Providers, Admins.
   - *Problem solved:* Ensures no participant misses time-sensitive perishable transactions.
   - *Dependencies:* Phases 2, 3, 6, 7.
2. **Admin User Governance, Listing Moderation & Verification Management (`FR-045`, `FR-046`, `FR-047`, `FR-050`)**
   - *What it does:* Central admin dashboard to search/filter users by role/status/LGA, review verification submissions (extending Phase 4's minimal queue), pause/remove fraudulent or misleading produce listings, and suspend/reactivate accounts under documented reason codes with mandatory audit logs.
   - *Users:* Administrators.
   - *Problem solved:* Protects marketplace trust during pilot onboarding (Section 26 Risk Management).
   - *Dependencies:* Phases 3, 4, 5.
3. **Order Monitoring, Reports & Dispute Management (`FR-048`, `FR-049`)**
   - *What it does:* Lets users submit structured reports/disputes on listings, orders, or users (e.g., produce quality mismatch, non-collection, suspected counterfeit/fraud), and enables Admins to inspect order/delivery/negotiation timelines, add resolution notes, and mark disputes resolved or escalate account actions.
   - *Users:* Farmers, Buyers, Transport Providers (file reports), Administrators (investigate & resolve).
   - *Problem solved:* Addresses Concept Doc Section 26 (fraudulent listings, quality disputes) honestly without claiming financial chargeback power.
   - *Dependencies:* Phases 6 & 7.
4. **Admin Translation Resource Manager (`FR-044`) & Essential Pilot Metrics**
   - *What it does:* Allows Admins to view missing or `DRAFT` translation keys across languages, update translations, mark strings `VALIDATED` after native-speaker review, and view plain, factual pilot counters (active farmers, listings, confirmed orders, completed deliveries — avoiding bloated decorative charts per design guidelines).
   - *Users:* Administrators.
   - *Problem solved:* Enables non-developer team members to manage validated Tiv/Hausa/Idoma translations cleanly and monitor Benue pilot targets (Section 22 & 24).
   - *Dependencies:* Phase 2 i18n architecture.

### C. Technical Implementation
- **Frontend Components & Pages:** Notification bell + `/notifications` inbox page; `/admin` overview (clean KPI summary cards), `/admin/users`, `/admin/listings`, `/admin/orders`, `/admin/disputes`, `/admin/translations`.
- **Backend Functionality:** Event-driven or service-level `notifyUser()` helper inserting `Notification` records with localized template keys + async dispatcher hook for optional Email/SMS providers; strict `ADMIN` role enforcement + immutable `AuditLog` entries on every moderation/suspension/dispute resolution action; cache invalidation hook when admin updates `TranslationEntry`.
- **Database Models & Relationships:** `Notification` (`userId`, `type`, `titleKey`, `bodyKey`, `paramsJson`, `linkUrl`, `isRead`, `channelStatus`), `ReportDispute` (`reporterId`, `targetType`, `targetId`, `orderId`, `reasonCode`, `description`, `status: OPEN | UNDER_REVIEW | RESOLVED | DISMISSED`, `resolvedById`, `resolutionNote`), `AuditLog` (already introduced, expanded actions).
- **API Endpoints / Server Actions:** `GET /api/notifications`, `PATCH /api/notifications/[id]/read`, `POST /api/reports`, `GET/PATCH /api/admin/users/[id]`, `PATCH /api/admin/listings/[id]/moderate`, `GET/PATCH /api/admin/disputes/[id]`, `GET/PUT /api/admin/translations`.
- **Security Considerations:** Only `ADMIN` can access `/admin/*` APIs; every admin mutation writes `actorId`, `action`, `targetId`, `reason`, and `timestamp` to `AuditLog`; suspending a user immediately invalidates active sessions and hides/pauses their active listings if configured.

### D. Completion Criteria
- Key marketplace and logistics actions create readable, localized in-app notifications visible immediately to target recipients.
- Admins can suspend a fraudulent user (immediately blocking their API access), deactivate a non-compliant listing, resolve a filed dispute, and edit + validate a translation string that reflects in the live UI.
- All admin actions produce queryable `AuditLog` entries.

### E. Dependencies
- **Prerequisite:** Phases 1–7; Product Owner confirms MVP notification channels (in-app only vs. email vs. paid SMS gateway).
- **Unlocks:** Clean operational support for Phase 9 extensions and Phase 10 pilot launch.

### F. Testing
- Notification delivery & localization test (user with `tiv` preference receives Tiv-templated notification or English fallback if unvalidated).
- Admin authorization test: Farmers, Buyers, and Transport Providers receive `403` on all `/api/admin/*` endpoints.
- Account suspension end-to-end test: suspended user's existing session fails on next request and active listings stop appearing in buyer search.
- Translation update test: Admin validates a translation key → user refreshes page → updated translation renders cleanly.

### G. Estimated Effort
- **Complexity:** Moderate.
- **Risks:** SMS notification delays/cost if telco registration (Termii/NCC Sender ID) is assumed without advance setup; scope creep into analytics charts (keep strictly factual operational tables/counters).

### H. Scope Classification
- **Essential MVP:** In-app notifications, Admin user/listing/order/dispute governance, Audit logs, Basic translation management, Core pilot counters.
- **Important but Deferrable:** Automated SMS/WhatsApp notifications (implement clean adapter interface first; enable live SMS once provider credentials & budget are approved).
- **Future Enhancement:** Real-time WebSocket push server, advanced BI dashboards, automated fraud scoring.

---

## Phase 9: MVP Extended Modules — Farmer-to-Farmer Barter & Simple Loan Workflow Demonstration

### A. Phase Identification
- **Phase Number:** 9
- **Phase Name:** Farmer-to-Farmer Barter Exchange & Simple Loan Workflow Demonstration
- **Main Objective:** Deliver the two extended MVP modules requested in the Master Prompt — structured Farmer-to-Farmer Exchange (barter) and a compliant Simple Loan Workflow Demonstration — as cleanly isolated modules layered atop Tongric's core marketplace, logistics, and transaction records.
- **Why This Phase Is Necessary:** Reconciles the Master Prompt's MVP goals with Concept Doc Section 4.4 (Innovation Four), Section 4.5 (Innovation Five), Journey D, and Journey E without delaying or destabilizing the core produce-to-delivery workflow (Phases 1–8).
- **Relationship to Tongric Product Vision:** Directly implements Concept Doc Sections 4.4, 4.5, 13 (Journeys D & E), 17 (financing & barter modules), and Section 27 (strictly partner-driven financing without unlicensed lending).

### B. Features and Functionality
1. **Farmer-to-Farmer Agricultural Exchange / Barter (`Section 4.4`, `Journey E`)**
   - *What it does:* Allows Farmers to post what agricultural asset they have (crops, seeds, permitted farm equipment/tools), available quantity, what they want in exchange, location, and condition/quality. Other Farmers can search exchange listings, initiate negotiation on swap ratios/quantities, finalize an `ExchangeAgreement`, optionally request transport through Phase 7 logistics, and record dual fulfilment confirmation (`Farmer A confirmed` + `Farmer B confirmed`).
   - *Users:* Farmers (and Admins for moderation/disputes).
   - *Problem solved:* Digitizes existing rural barter practices so farmers short on cash can trade surpluses for needed seeds or crops.
   - *Dependencies:* Phases 3, 4, 5 (catalogs/images), 7 (optional transport link), 8 (notifications/moderation).
2. **Simple Loan Workflow Demonstration (`Section 4.5`, `Journey D`, `Section 12.5`)**
   - *What it does:* Demonstrates how smallholder farmers can discover financing without Tongric acting as a lender:
     - **Partner Financing Directory:** Displays sample/partner loan products (managed by Admin or a constrained Financial Partner role per Section 12.5 line 903) showing lender name, loan purpose, min/max amount, indicative interest/repayment terms, required documents, and eligibility criteria.
     - **Consented Transaction Summary & Loan Application:** Farmers select a product, read localized terms & disclosures (explicitly stating the financial partner makes all credit/disbursement decisions), grant explicit **consent** (`ConsentRecord`) to attach their Tongric completed sales/delivery summary, upload required documents, and submit an application receiving a unique reference code (`LN-YYYY-XXXX`).
     - **Application Progress Tracking:** Farmers track application statuses (`SUBMITTED → UNDER_PARTNER_REVIEW → ADDITIONAL_INFO_REQUESTED → APPROVED | DECLINED`), while Admin/Partner Demo Reviewer updates status with notes to demonstrate the complete lifecycle safely.
   - *Users:* Farmers, Administrators (or scoped Financial Partner Reviewer role if approved).
   - *Problem solved:* Demonstrates Journey D and Section 4.5's transaction-history-enabled pathway to formal finance without violating CBN/regulatory licensing rules (Section 27).
   - *Dependencies:* Phases 3 (NDPA Consent), 4 (Farmer Profile & private document storage), 6–7 (Completed order/delivery transaction history), 8 (Notifications).

### C. Technical Implementation
- **Frontend Components & Pages:**
  - Barter: `/exchange` (feed & search), `/exchange/new`, `/exchange/[id]` (negotiation & agreement action), `/exchange/agreements/[id]` (dual confirmation + optional transport link).
  - Loan Demo: `/finance` (partner product catalog + disclaimer banner), `/finance/products/[id]/apply` (consent checkbox + live transaction history preview + doc upload), `/finance/applications` & `/finance/applications/[id]` (reference tracker), `/admin/finance` (manage partner products & update demo/partner application statuses).
- **Backend Functionality:** Separate modular services (`src/modules/barter/*`, `src/modules/finance/*`); transaction summary aggregator pulling only `COMPLETED` orders/deliveries *after* explicit consent record creation; status transition guards on both barter agreements and loan applications.
- **Database Models & Relationships:**
  - Barter: `ExchangeListing` (`ownerFarmerId`, `offeredItemType`, `offeredCropId`, `offeredDescription`, `offeredQty`, `offeredUnit`, `desiredDescription`, `desiredQty`, `locationId`, `status`), `ExchangeOffer` (`listingId`, `proposerFarmerId`, `proposedQty`, `requestedQty`, `status`), `ExchangeAgreement` (`listingId`, `offerId`, `farmerAId`, `farmerBId`, `farmerAConfirmedAt`, `farmerBConfirmedAt`, `status`).
  - Finance: `FinancingProduct` (`partnerName`, `title`, `description`, `eligibilityText`, `interestRateSummary`, `repaymentTerms`, `isDemoProduct`, `isActive`), `LoanApplication` (`referenceCode`, `farmerId`, `productId`, `requestedAmountNgn`, `purpose`, `consentRecordId`, `transactionSummarySnapshotJson`, `documentKeys[]`, `status`, `partnerNote`).
- **API Endpoints / Server Actions:** `/api/exchange/listings`, `/api/exchange/offers`, `/api/exchange/agreements/[id]/confirm`, `/api/finance/products`, `/api/finance/applications`, `/api/admin/finance/products`, `/api/admin/finance/applications/[id]`.
- **Security & Compliance:** Mandatory explicit `ConsentRecord` before attaching commercial history snapshot to `LoanApplication`; private signed-URL storage for loan documents; prominent disclaimer that Tongric is not a bank/lender and does not disburse or guarantee loans (Concept Doc Section 4.5 line 462, Section 27 line 1746).

### D. Completion Criteria
- A Farmer can publish a barter listing, receive an exchange proposal from another Farmer, reach an agreement, and require both parties' confirmation to mark the swap `COMPLETED`.
- A Farmer can browse financing products, explicitly consent to share their Tongric transaction summary, upload a document, submit a loan application, receive a reference ID, and observe status transitions updated via the partner/admin workflow.
- Attempting to submit a loan application without explicit NDPA data-sharing consent is rejected by the server.

### E. Dependencies
- **Prerequisite:** Phases 1–8; Product Owner confirms barter rules (1-to-1 single swaps vs. partial quantity swaps, whether transport applies to one leg or two) and whether Financial Partner users need separate login accounts or Admin-operated demo review is sufficient for MVP.
- **Unlocks:** Complete feature set ready for Phase 10 verification and Benue pilot demo.

### F. Testing
- Barter permissions test: Buyers/Transport Providers blocked from posting farmer barter swaps (unless allowed); both Farmer A and Farmer B confirmations required before `COMPLETED`.
- Loan consent & snapshot test: verifies `ConsentRecord` saved alongside immutable transaction summary snapshot; verifies non-owner farmers cannot view someone else's loan docs or application status.
- Disclaimer & empty-history test: new farmer with `0` completed transactions can still submit a loan application cleanly with zero-history snapshot clearly shown.

### G. Estimated Effort
- **Complexity:** Moderate (two clean self-contained modules reusing Phase 1–8 patterns).
- **Risks:** Scope creep into full financial institution portal, credit scoring algorithms, or multi-item barter matching; must stay strictly aligned with "simple loan workflow demonstration" and Concept Doc Section 4.4's secondary status.

### H. Scope Classification
- **Essential MVP (per Master Prompt priority reconciliation):** Structured 1-to-1 Barter exchange, Simple Loan Workflow Demonstration (Partner product directory, consented transaction summary, application submission & status tracking).
- **Important but Deferrable:** Dedicated Financial Institution external self-service portal, partial/multi-party barter matching, Basic Input Supplier directory (Concept Doc 4.6).
- **Future Enhancement:** Live banking API integrations, automated credit scoring models, input marketplace checkout, escrow.

---

## Phase 10: End-to-End Verification, Low-Connectivity Optimization & Pilot Readiness

### A. Phase Identification
- **Phase Number:** 10
- **Phase Name:** End-to-End Verification, Low-Connectivity Optimization & Benue Pilot Readiness
- **Main Objective:** Validate the entire platform against real Nigerian rural conditions (low-end Android viewports, 2G/3G throttling, multilingual completeness), enforce security & NDPA 2023 compliance, seed realistic Benue State demo/pilot data, and prepare deployment & pilot evaluation readiness.
- **Why This Phase Is Necessary:** A feature-complete app that fails under slow 3G connectivity, leaks private documents, breaks in Tiv/Hausa layouts, or lacks realistic onboarding data will fail immediately in the Benue pilot (Concept Doc Section 21 Weeks 11–12 & Section 22).
- **Relationship to Tongric Product Vision:** Implements Concept Doc Section 15 (Non-Functional Requirements), Section 21 (Weeks 11–12), Section 22 (Pilot Deployment Strategy), Section 24 (Impact Measurement baseline readiness), and Section 27 (NDPA 2023).

### B. Features and Functionality
1. **End-to-End Multi-Role Workflow & Concurrency Test Suite**
   - *What it does:* Automated + structured manual testing covering Journey A–E end-to-end across Farmer, Buyer, Transport Provider, and Admin roles, including race conditions, permissions, and failure recovery.
   - *Users:* Engineering & Product team.
2. **Low-Bandwidth & Low-End Mobile Optimization Audit**
   - *What it does:* Audits bundle sizes, Next.js route payloads, image weights, caching headers, slow-3G form retry behavior, and `320px`–`375px` mobile ergonomics across English and pilot Nigerian languages (handling longer translated text without layout overflow).
   - *Users:* Rural farmers & drivers on budget Android devices.
3. **Security, Privacy & NDPA 2023 Readiness Review**
   - *What it does:* Verifies input validation, XSS/CSRF/SQLi protection, rate limiting, RBAC enforcement across every API route, private document signed-URL expiry, data minimization, and localized privacy notices.
   - *Users:* All users & regulatory compliance.
4. **Benue State Pilot Seeding, Assisted Onboarding Guide & Deployment Pipeline**
   - *What it does:* Prepares clean idempotent seed scripts (Benue 23 LGAs, priority crops, sample validated translation starter keys, sample partner loan products, test accounts per role for demonstration), production deployment checklist, DB backup verification, and pilot baseline data export (Concept Doc Section 24).
   - *Users:* Founding team, community agents, pilot evaluators.

### C. Technical Implementation
- **Testing & Tooling:** Playwright (or Cypress) end-to-end browser tests simulating slow 3G and mobile viewport (`360x800`); Vitest/Jest integration & concurrency suite; Lighthouse/Next bundle analyzer check; OWASP baseline header & auth audit script.
- **Operational Deliverables:** `prisma/seed.ts` (Benue pilot reference data + demo mode seed separate from prod), production `.env.example`, backup/restore runbook, Admin CSV export for anonymized pilot metrics (Concept Doc Section 24).
- **Security Checks:** Automated route authorization matrix test verifying every protected endpoint against all 4 roles + unauthenticated visitor.

### D. Completion Criteria
- 100% of core E2E journeys (Produce Listing → Negotiation → Atomic Order → Transport Quote → 6-Step Delivery → Completion; Barter; Simple Loan Demo) pass cleanly on mobile viewport and throttled network conditions.
- Zero critical/high security vulnerabilities or unauthenticated PII/document leaks.
- All MVP UI keys exist in English and selected pilot languages (flagging any untranslated keys clearly for native-speaker completion prior to public pilot).
- Application deploys cleanly to staging/production environment with verified PostgreSQL backups and `/api/health` monitoring.

### E. Dependencies
- **Prerequisite:** Phases 1–9 complete; native-speaker review of pilot language strings completed by team/community reviewers; target hosting & domain credentials confirmed by Product Owner.
- **Unlocks:** Live Benue State community pilot launch and USPF Changemakers Challenge product demonstration.

### F. Testing
- Full E2E suite (Playwright/Vitest), network-interruption recovery test (disconnect mid-submission → retry banner → single clean submission), RBAC matrix test, and user usability walkthrough with founding team / pilot testers.

### G. Estimated Effort
- **Complexity:** Moderate–High (thorough QA, performance tuning, and linguistic validation coordination).
- **Risks:** Discovering late layout breakage caused by long Tiv/Hausa strings or missing native translations if linguistic review starts too late (mitigated by Phase 2 early setup).

### H. Scope Classification
- **Essential MVP:** E2E & RBAC testing, 3G/mobile optimization, NDPA/security checks, Benue seed catalogs, deployment & backup readiness.
- **Important but Deferrable:** Automated multi-region load testing (pilot starts with ~100 farmers, 10 buyers, 5 transporters per Section 22).
- **Future Enhancement:** Automated continuous synthetic monitoring, advanced impact analytics dashboard.

---

## Master Scope Classification Summary

| Capability Area | Concept Doc Ref | Classification | Target Phase |
|---|---|---|---|
| Modular monolith, Postgres, White/Green UI kit | Sec 3, 16, 17 | **Essential MVP** | Phase 1 |
| Configurable multilingual framework & image compression | Sec 4.3, 9.3, Mod 7 | **Essential MVP** | Phase 2 |
| Auth, RBAC, Nigerian phone/login, NDPA consent | Mod 1, Sec 27 | **Essential MVP** | Phase 3 |
| Farmer/Buyer/Transport profiles, Benue catalogs, Verification | Mod 2, Sec 4.2, 7 | **Essential MVP** | Phase 4 |
| Produce listings, photos, Buyer search & filters | Mod 3, Sec 4.1 | **Essential MVP** | Phase 5 |
| Enquiries, Offers, Atomic Orders & Quantity locking | Mod 3–4, Sec 18 | **Essential MVP** | Phase 6 |
| Transport search, requests, quotes, 6-step delivery & confirmation | Mod 5, Sec 4.2 | **Essential MVP** | Phase 7 |
| Localized in-app notifications & Admin console | Mod 6, 7, 8 | **Essential MVP** | Phase 8 |
| Farmer-to-Farmer Barter Exchange | Sec 4.4, Master Prompt | **Extended MVP (Reconciled)** | Phase 9 |
| Simple Loan Workflow Demonstration (partner/admin review) | Sec 4.5, Master Prompt | **Extended MVP (Reconciled)** | Phase 9 |
| E2E QA, Low-data hardening, Security, Pilot seeding | Sec 15, 21, 22, 24 | **Essential MVP** | Phase 10 |
| Buyer Purchase Requests (RFQs), Reviews, Storage directory | Sec 4.1, 4.2, 12.2 | **Important but Deferrable** | Optional in 6/7 or Post-Pilot |
| SMS / WhatsApp notifications (live paid gateway) | Sec 9.6, 16 | **Important but Deferrable** | Adapter in Phase 8; Live post-credentials |
| Agricultural Input Supplier Marketplace | Sec 4.6, 20 | **Future / Second Release** | Deferred past Release 1 |
| Live GPS tracking & route optimization | Sec 4.2, 20 | **Future Enhancement** | Deferred past Release 1 |
| Licensed payment gateway / compliant escrow | Sec 19 | **Future Enhancement** | Deferred past Release 1 |
| USSD access & Voice-assisted navigation | Sec 4.3, 9.6, 20 | **Future Enhancement** | Deferred past Release 1 |
| AI Soil Analysis & Satellite Intelligence | Sec 4.7, 20 | **Future Enhancement** | Deferred past Release 1 |

---

## Recommended Starting Point: Phase 1

**Phase 1 (Project Foundation, Design System & Core Architecture)** must be implemented first because:
1. It establishes the Next.js + TypeScript + PostgreSQL + Prisma foundation and clean module boundaries that every subsequent phase imports.
2. It locks in Tongric's accessible, low-data, white-and-green design system before UI screens proliferate.
3. It sets up environment validation, private-vs-public file storage boundaries, and network-retry primitives required for rural Nigerian reliability and NDPA 2023 security from the very first commit.
