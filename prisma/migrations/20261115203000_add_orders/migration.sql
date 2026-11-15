-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CONFIRMED', 'TRANSPORT_REQUESTED', 'TRANSPORT_ASSIGNED', 'COLLECTED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_code" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "farmer_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "crop_code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_code" TEXT NOT NULL,
    "estimated_weight_kg" DOUBLE PRECISION NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "total_amount" DECIMAL(14,2) NOT NULL,
    "fulfillment_mode" "FulfillmentMode" NOT NULL,
    "destination_location" TEXT,
    "proposed_collection_date" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'CONFIRMED',
    "payment_arrangement_note" TEXT,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_offer_id_key" ON "orders"("offer_id");

-- CreateIndex
CREATE INDEX "orders_farmer_id_status_idx" ON "orders"("farmer_id", "status");

-- CreateIndex
CREATE INDEX "orders_buyer_id_status_idx" ON "orders"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "orders_listing_id_idx" ON "orders"("listing_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "order_status_events_order_id_created_at_idx" ON "order_status_events"("order_id", "created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "commercial_offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "produce_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

