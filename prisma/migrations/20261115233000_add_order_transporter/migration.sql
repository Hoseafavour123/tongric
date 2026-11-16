-- AlterTable
ALTER TABLE "orders" ADD COLUMN "transporter_id" TEXT,
ADD COLUMN "corridor_route" TEXT,
ADD COLUMN "estimated_freight_fee" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "orders_transporter_id_status_idx" ON "orders"("transporter_id", "status");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_transporter_id_fkey" FOREIGN KEY ("transporter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

