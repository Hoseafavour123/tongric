# TONGRIC MVP — BENUE STATE PILOT RUNBOOK & DEPLOYMENT GUIDE

**Pilot Target:** Benue State, Nigeria (Food Basket of the Nation)  
**Pilot Corridors:** Makurdi (Capital & Wholesale Terminal), Gboko (Yam & Citrus Hub), Ukum (Zaki-Biam International Yam Market), Katsina-Ala (Grain Basin), Otukpo (Southern Agricultural Axis), and Wannune (Soya Belt).  
**Release:** MVP 1.0.0 (Phases 1–10 Complete & Production Verified)  
**Regulatory Model:** Section 19 Direct Settlement Compliant (Non-Custodial Agricultural Commerce, Logistics, and Farmer Barter).

---

## 1. Pilot Demonstration Credentials

All demo user accounts are pre-seeded with hashed scrypt passwords (`Password123!`) and verified phone numbers in the live database:

| Role | Name & Affiliation | Phone Number | Password | LGA & Locale | Pilot Capabilities Demonstrated |
|---|---|---|---|---|---|
| **Farmer** | Terna Aondover (Gboko Farmers Coop) | `08011111111` | `Password123!` | Gboko (`tiv`) | Lists harvest batches, accepts buyer purchase offers, holds farm-gate **Pickup PIN**, initiates barter swaps, applies for cooperative credit with verified sales history. |
| **Buyer** | Emeka Okonkwo (AgroVentures Wholesale) | `08022222222` | `Password123!` | Makurdi (`en`) | Discovers produce, submits purchase offers, tracks in-transit orders, holds destination **Delivery PIN**, inspects dispatch waybills, submits 5-star carrier reviews. |
| **Transporter** | Danladi Ibrahim (Benue Express Haulage) | `08033333333` | `Password123!` | Makurdi (`ha`) | Browses corridor load board, claims freight routes based on truck capacity (10,000 kg), inputs Farmer Pickup PIN and Buyer Delivery PIN to verify handover. |
| **Administrator** | Oche Idoko (Pilot Operations Lead) | `08099999999` | `Password123!` | Makurdi (`en`) | Verifies KYC identity documents, monitors platform metrics, assists farmer onboarding, arbitrates disputes, reviews partner cooperative loan applications. |
| **Assisted Farmer** | Abeje Ochanya (Idoma Agro Women Coop) | `08012223344` | `Password123!` | Otukpo (`ido`) | Enrolled via community assisted onboarding; participates in produce barter and dry-season cooperative input micro-loans. |

---

## 2. Low-Connectivity & Low-Data Guardrails

Tongric is optimized specifically for rural 2G/3G connectivity in Benue agricultural communities:

1. **Client-Side Canvas Image Compression:**
   - Any phone camera photo (up to 20MB) is scaled and compressed client-side to `<= 1280px` dimension and `<= 200 KB` WebP/JPEG before upload.
   - Saves mobile data costs for rural farmers and prevents upload timeout failures over weak cellular signals.

2. **Low-Data Mode (`LowDataSwitch`):**
   - When Low-Data Mode is active, produce images are deferred and replaced with lightweight placeholder cards and explicit "Load photo" triggers.
   - Dramatically reduces page payload from ~2MB to under ~80KB.

3. **Offline Service Worker (`public/sw.js`):**
   - Service worker caches static assets and the `/offline` fallback page (`tongric-static-v2`).
   - If cellular connectivity drops during transit between rural markets, users see a clear network recovery status banner with safe retry buttons.
   - API endpoints (`/api/*`) are never cached to ensure strict inventory accuracy and avoid ghost orders.

4. **Network-Resilient Fetch & Idempotency:**
   - All financial and commercial state mutations automatically attach an `Idempotency-Key` HTTP header.
   - If a network request times out, retry submissions cannot result in double orders, duplicated offer acceptances, or repeated loan submissions.

5. **Multilingual Completeness:**
   - English (`en`), Tiv (`tiv`), Idoma (`ido`), and Hausa (`ha`) dictionaries synchronized into PostgreSQL.
   - 100% of core UI keys render without blank labels or layout overflow on narrow mobile screens (320px–375px).

---

## 3. End-to-End Operational Workflows

### Workflow A: Produce Discovery & Atomic Order Execution
1. **Farmer** logs in and lists 500 tubers of Zaki-Biam Yam at `₦1,200/tuber` on `/market/create`.
2. **Buyer** discovers the listing on `/market` using Benue LGA filters (Ukum / Gboko) and submits an offer for 200 tubers.
3. **Farmer** reviews the enquiry on `/orders/offers/[id]` and accepts.
4. **Platform Core** atomically locks inventory with row-level locks, creates Order `ORD-YYYYMM-XXXXX`, assigns Waybill `WB-YYYYMM-XXXXX`, and generates cryptographic 4-digit handover PINs:
   - Farmer Pickup PIN: `5821`
   - Buyer Delivery PIN: `9412`

### Workflow B: Logistics Haulage & PIN-Verified Handover
1. **Transporter** views open freight haulage on `/transport`, verifies cargo weight (600 kg) against truck capacity, and claims the corridor run (`Zaki-Biam → Makurdi`).
2. Transporter arrives at the farm gate; Farmer inspects truck and provides **Pickup PIN** `5821`.
3. Transporter inputs PIN via `/orders/[id]`; status transitions to `IN_TRANSIT` with timestamped waybill event.
4. Transporter delivers produce to Buyer in Makurdi; Buyer inspects produce quality and provides **Delivery PIN** `9412`.
5. Transporter inputs PIN; status transitions to `DELIVERED`. Buyer confirms receipt, order marks `COMPLETED`, and Buyer rates Transporter (5-star carrier haulage review).

### Workflow C: Farmer-to-Farmer Agricultural Barter Exchange
1. **Farmer A** (Yam grower in Gboko) posts a barter listing on `/exchange/new` seeking 3 Bags of Soybeans in exchange for 100 Tubers of Yam.
2. Built-in **Crop Parity Calculator** validates fair market parity based on Benue harvest reference prices.
3. **Farmer B** (Soybean grower in Otukpo) discovers listing and proposes trade agreement.
4. Both farmers meet at Wannune market junction; both click **Confirm Fulfillment** on `/exchange/agreements/[id]`. Agreement transitions to `COMPLETED`.

### Workflow D: Simple Cooperative Financing Demonstration
1. Farmer navigates to `/finance` and runs the **Commercial Credit Readiness Simulator**.
2. Platform evaluates verified transaction history (KYC tier, completed delivery volume, platform tenure) to generate a credit score (0–100) and recommended credit tier.
3. Farmer selects a partner facility (e.g. *BADC Seasonal Grain Working Capital*), checks mandatory NDPA 2023 data-sharing consent, and submits application `LN-YYYYMM-XXXXX`.
4. Platform snapshots immutable verified sales volume without custodying funds (Section 19 compliance).
5. Administrator / Partner reviews application on `/admin/finance` and records underwriting status (`APPROVED` / `UNDER_PARTNER_REVIEW`).

---

## 4. Disaster Recovery, Backups & Health Monitoring

- **Health Check Endpoint:** `GET /api/health` monitors live PostgreSQL database reachability and latency.
- **Automated Verification:**
  - `npm test`: 81 test files, 415 unit and E2E tests passing.
  - `npm run typecheck`: 0 TypeScript compiler errors (`tsc --noEmit`).
  - `npm run lint`: 0 ESLint errors and 0 warnings.
  - `npm run build`: Production build cleanly compiles all 48 routes.
- **Database Idempotent Seeder:** `npm run db:seed` safely synchronizes multilingual dictionaries, partner products, demo users, realistic listings, and sample order histories.

