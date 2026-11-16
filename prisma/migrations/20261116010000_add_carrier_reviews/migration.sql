-- CreateTable
CREATE TABLE "carrier_reviews" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "transporter_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "timeliness_score" INTEGER NOT NULL DEFAULT 5,
    "cargo_care_score" INTEGER NOT NULL DEFAULT 5,
    "communication_score" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrier_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carrier_reviews_order_id_reviewer_id_key" ON "carrier_reviews"("order_id", "reviewer_id");

-- CreateIndex
CREATE INDEX "carrier_reviews_transporter_id_rating_idx" ON "carrier_reviews"("transporter_id", "rating");

-- CreateIndex
CREATE INDEX "carrier_reviews_reviewer_id_idx" ON "carrier_reviews"("reviewer_id");

-- AddForeignKey
ALTER TABLE "carrier_reviews" ADD CONSTRAINT "carrier_reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_reviews" ADD CONSTRAINT "carrier_reviews_transporter_id_fkey" FOREIGN KEY ("transporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_reviews" ADD CONSTRAINT "carrier_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

