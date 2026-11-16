-- AlterEnum
ALTER TYPE "ConsentType" ADD VALUE 'FINANCIAL_DATA_SHARING';

-- CreateEnum
CREATE TYPE "ExchangeItemType" AS ENUM ('CROP', 'SEED', 'TOOL', 'EQUIPMENT');

-- CreateEnum
CREATE TYPE "ExchangeListingStatus" AS ENUM ('OPEN', 'AGREED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExchangeOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ExchangeAgreementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoanApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_PARTNER_REVIEW', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "exchange_listings" (
    "id" TEXT NOT NULL,
    "owner_farmer_id" TEXT NOT NULL,
    "offered_item_type" "ExchangeItemType" NOT NULL DEFAULT 'CROP',
    "offered_crop_id" TEXT,
    "offered_title" TEXT NOT NULL,
    "offered_description" TEXT NOT NULL,
    "offered_qty" DOUBLE PRECISION NOT NULL,
    "offered_unit" TEXT NOT NULL,
    "desired_description" TEXT NOT NULL,
    "desired_qty" DOUBLE PRECISION,
    "desired_unit" TEXT,
    "location_lga" TEXT NOT NULL,
    "status" "ExchangeListingStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_offers" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "proposer_farmer_id" TEXT NOT NULL,
    "offered_item_description" TEXT NOT NULL,
    "offered_qty" DOUBLE PRECISION NOT NULL,
    "offered_unit" TEXT NOT NULL,
    "message" TEXT,
    "status" "ExchangeOfferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_agreements" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "farmer_a_id" TEXT NOT NULL,
    "farmer_b_id" TEXT NOT NULL,
    "terms_summary" TEXT NOT NULL,
    "farmer_a_confirmed_at" TIMESTAMP(3),
    "farmer_b_confirmed_at" TIMESTAMP(3),
    "status" "ExchangeAgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financing_products" (
    "id" TEXT NOT NULL,
    "partner_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "min_amount_ngn" INTEGER NOT NULL,
    "max_amount_ngn" INTEGER NOT NULL,
    "interest_rate_summary" TEXT NOT NULL,
    "repayment_terms" TEXT NOT NULL,
    "eligibility_text" TEXT NOT NULL,
    "required_documents" JSONB NOT NULL,
    "is_demo_product" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financing_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_applications" (
    "id" TEXT NOT NULL,
    "reference_code" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "requested_amount_ngn" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "consent_record_id" TEXT NOT NULL,
    "transaction_summary_snapshot_json" JSONB NOT NULL,
    "document_keys" JSONB NOT NULL,
    "status" "LoanApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "partner_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exchange_listings_owner_farmer_id_status_idx" ON "exchange_listings"("owner_farmer_id", "status");

-- CreateIndex
CREATE INDEX "exchange_listings_status_location_lga_idx" ON "exchange_listings"("status", "location_lga");

-- CreateIndex
CREATE INDEX "exchange_offers_listing_id_status_idx" ON "exchange_offers"("listing_id", "status");

-- CreateIndex
CREATE INDEX "exchange_offers_proposer_farmer_id_status_idx" ON "exchange_offers"("proposer_farmer_id", "status");

-- CreateIndex
CREATE INDEX "exchange_agreements_farmer_a_id_idx" ON "exchange_agreements"("farmer_a_id");

-- CreateIndex
CREATE INDEX "exchange_agreements_farmer_b_id_idx" ON "exchange_agreements"("farmer_b_id");

-- CreateIndex
CREATE INDEX "exchange_agreements_status_idx" ON "exchange_agreements"("status");

-- CreateIndex
CREATE INDEX "financing_products_is_active_idx" ON "financing_products"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "loan_applications_reference_code_key" ON "loan_applications"("reference_code");

-- CreateIndex
CREATE INDEX "loan_applications_farmer_id_status_idx" ON "loan_applications"("farmer_id", "status");

-- CreateIndex
CREATE INDEX "loan_applications_product_id_status_idx" ON "loan_applications"("product_id", "status");

-- AddForeignKey
ALTER TABLE "exchange_listings" ADD CONSTRAINT "exchange_listings_owner_farmer_id_fkey" FOREIGN KEY ("owner_farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "exchange_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_offers" ADD CONSTRAINT "exchange_offers_proposer_farmer_id_fkey" FOREIGN KEY ("proposer_farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_agreements" ADD CONSTRAINT "exchange_agreements_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "exchange_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_agreements" ADD CONSTRAINT "exchange_agreements_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "exchange_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_agreements" ADD CONSTRAINT "exchange_agreements_farmer_a_id_fkey" FOREIGN KEY ("farmer_a_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_agreements" ADD CONSTRAINT "exchange_agreements_farmer_b_id_fkey" FOREIGN KEY ("farmer_b_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "financing_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_applications" ADD CONSTRAINT "loan_applications_consent_record_id_fkey" FOREIGN KEY ("consent_record_id") REFERENCES "consent_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

