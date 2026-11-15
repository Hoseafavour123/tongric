-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "farmer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Benue',
    "lga" TEXT NOT NULL,
    "community" TEXT NOT NULL,
    "primary_crops" TEXT[],
    "cooperative_name" TEXT,
    "farm_size_hectares" DECIMAL(8,2),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "farmer_profiles_user_id_key" ON "farmer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "farmer_profiles_lga_idx" ON "farmer_profiles"("lga");

-- CreateIndex
CREATE INDEX "farmer_profiles_verification_status_idx" ON "farmer_profiles"("verification_status");

-- AddForeignKey
ALTER TABLE "farmer_profiles" ADD CONSTRAINT "farmer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
