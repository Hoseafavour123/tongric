-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('PROCESSOR', 'WHOLESALER', 'RETAILER', 'RESTAURANT_HOTEL', 'INSTITUTIONAL');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE_TRICYCLE', 'PICKUP', 'VAN', 'TRUCK');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FIXED_RATE_CARD', 'QUOTE_ON_REQUEST');

-- CreateTable
CREATE TABLE "buyer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "buyer_type" "BuyerType" NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Benue',
    "operating_lga" TEXT NOT NULL,
    "primary_market" TEXT,
    "crops_sourced" TEXT[],
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "vehicle_types" "VehicleType"[],
    "max_capacity_kg" INTEGER NOT NULL,
    "operating_lgas" TEXT[],
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'QUOTE_ON_REQUEST',
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_profiles_user_id_key" ON "buyer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "buyer_profiles_operating_lga_idx" ON "buyer_profiles"("operating_lga");

-- CreateIndex
CREATE INDEX "buyer_profiles_buyer_type_idx" ON "buyer_profiles"("buyer_type");

-- CreateIndex
CREATE INDEX "buyer_profiles_verification_status_idx" ON "buyer_profiles"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX "transport_profiles_user_id_key" ON "transport_profiles"("user_id");

-- CreateIndex
CREATE INDEX "transport_profiles_is_available_idx" ON "transport_profiles"("is_available");

-- CreateIndex
CREATE INDEX "transport_profiles_verification_status_idx" ON "transport_profiles"("verification_status");

-- AddForeignKey
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_profiles" ADD CONSTRAINT "transport_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
