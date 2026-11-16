-- AlterTable
ALTER TABLE "orders" ADD COLUMN "waybill_number" TEXT,
ADD COLUMN "pickup_pin" TEXT,
ADD COLUMN "delivery_pin" TEXT,
ADD COLUMN "pickup_verified_at" TIMESTAMP(3),
ADD COLUMN "delivery_verified_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "orders_waybill_number_key" ON "orders"("waybill_number");

