-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "FulfillmentMode" AS ENUM ('BUYER_ARRANGES_PICKUP', 'FARMER_ARRANGES_DELIVERY', 'TONGRIC_LOGISTICS_REQUEST');

-- CreateTable
CREATE TABLE "commercial_offers" (
    "id" TEXT NOT NULL,
    "offer_code" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "quantity" INTEGER NOT NULL,
    "unit_code" TEXT NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "total_amount" DECIMAL(14,2) NOT NULL,
    "fulfillment_mode" "FulfillmentMode" NOT NULL,
    "destination_location" TEXT,
    "proposed_collection_date" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "counter_round_count" INTEGER NOT NULL DEFAULT 0,
    "last_action_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_messages" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "proposed_quantity" INTEGER,
    "proposed_unit_price" DECIMAL(12,2),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commercial_offers_offer_code_key" ON "commercial_offers"("offer_code");

-- CreateIndex
CREATE INDEX "commercial_offers_listing_id_status_idx" ON "commercial_offers"("listing_id", "status");

-- CreateIndex
CREATE INDEX "commercial_offers_buyer_id_status_idx" ON "commercial_offers"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "commercial_offers_farmer_id_status_idx" ON "commercial_offers"("farmer_id", "status");

-- CreateIndex
CREATE INDEX "commercial_offers_expires_at_idx" ON "commercial_offers"("expires_at");

-- CreateIndex
CREATE INDEX "offer_messages_offer_id_created_at_idx" ON "offer_messages"("offer_id", "created_at");

-- AddForeignKey
ALTER TABLE "commercial_offers" ADD CONSTRAINT "commercial_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "produce_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_offers" ADD CONSTRAINT "commercial_offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_offers" ADD CONSTRAINT "commercial_offers_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commercial_offers" ADD CONSTRAINT "commercial_offers_last_action_by_id_fkey" FOREIGN KEY ("last_action_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_messages" ADD CONSTRAINT "offer_messages_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "commercial_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_messages" ADD CONSTRAINT "offer_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

