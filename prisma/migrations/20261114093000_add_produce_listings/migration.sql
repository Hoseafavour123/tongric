-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'SOLD_OUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProduceGrade" AS ENUM ('GRADE_A', 'GRADE_B', 'GRADE_C');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE_NOW', 'UPCOMING_HARVEST');

-- CreateTable
CREATE TABLE "produce_listings" (
    "id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "crop_code" TEXT NOT NULL,
    "crop_category" TEXT NOT NULL,
    "grade" "ProduceGrade" NOT NULL DEFAULT 'GRADE_B',
    "quantity" INTEGER NOT NULL,
    "unit_code" TEXT NOT NULL,
    "estimated_weight_kg" DOUBLE PRECISION NOT NULL,
    "price_per_unit" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "min_order_quantity" INTEGER NOT NULL DEFAULT 1,
    "is_negotiable" BOOLEAN NOT NULL DEFAULT true,
    "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE_NOW',
    "harvest_date" TIMESTAMP(3),
    "state" TEXT NOT NULL DEFAULT 'Benue',
    "lga" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "description" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "file_storage_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "produce_listings_farmer_id_idx" ON "produce_listings"("farmer_id");

-- CreateIndex
CREATE INDEX "produce_listings_crop_code_idx" ON "produce_listings"("crop_code");

-- CreateIndex
CREATE INDEX "produce_listings_lga_idx" ON "produce_listings"("lga");

-- CreateIndex
CREATE INDEX "produce_listings_status_idx" ON "produce_listings"("status");

-- CreateIndex
CREATE INDEX "produce_listings_created_at_idx" ON "produce_listings"("created_at");

-- CreateIndex
CREATE INDEX "listing_photos_listing_id_idx" ON "listing_photos"("listing_id");

-- AddForeignKey
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "produce_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

