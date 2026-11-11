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
- **DEC-001 (Architecture):** Replace Concept Doc Section 16's separate Express backend + Next.js frontend with a **single Next.js App Router modular monolith** (`src/modules/*` + Route Handlers/Server Actions + Prisma) to avoid duplicated types, cross-origin auth complexity, and dual hosting cost.
- **DEC-002 (UI Primitives):** Use **Tailwind CSS + accessible headless primitives** (e.g., minimal Radix UI primitives or custom accessible React components—confirm preference during Phase 1) styled strictly to Tongric's white/green design system.
- **DEC-003 (Scope Sequencing):** Build core produce marketplace + logistics + multilingual + admin in Phases 1–8; isolate Barter and Simple Loan Workflow Demo in Phase 9 so core produce-to-delivery validation stays on track.

---

## 3. Open Product Decisions To Resolve Sequentially (Do Not Assume)

### Before / During Phase 1
- **Q-1.1:** Database hosting choice for dev & deployment (e.g., local PostgreSQL/Docker vs. managed Supabase/Neon/Railway)?
- **Q-1.2:** File storage provider for produce photos and private KYC documents (local disk for dev + S3-compatible R2/S3/Cloudinary for prod—confirm credentials & cost preference)?
- **Q-1.3:** Preferred deployment target (Vercel, Railway, Render, VPS)?

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
*Decisions will be logged here with date, rationale, and approved specification links as we work sequentially through each phase.*

