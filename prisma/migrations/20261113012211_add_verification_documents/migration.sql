-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NATIONAL_ID', 'VOTERS_CARD', 'DRIVERS_LICENSE', 'CAC_CERTIFICATE', 'COOPERATIVE_LETTER', 'COMMUNITY_ATTESTATION');

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "document_number" TEXT,
    "file_storage_path" TEXT NOT NULL,
    "file_mime_type" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "notes" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_documents_user_id_idx" ON "verification_documents"("user_id");

-- CreateIndex
CREATE INDEX "verification_documents_status_idx" ON "verification_documents"("status");

-- CreateIndex
CREATE INDEX "verification_documents_reviewed_at_idx" ON "verification_documents"("reviewed_at");

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
