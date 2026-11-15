-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'VALIDATED');

-- CreateTable
CREATE TABLE "languages" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPilotPriority" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "translation_keys" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "defaultText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_entries" (
    "id" TEXT NOT NULL,
    "translationKeyId" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "status" "TranslationStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewedByName" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "languages_isActive_sortOrder_idx" ON "languages"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "translation_keys_key_key" ON "translation_keys"("key");

-- CreateIndex
CREATE INDEX "translation_keys_namespace_idx" ON "translation_keys"("namespace");

-- CreateIndex
CREATE INDEX "translation_entries_languageCode_status_idx" ON "translation_entries"("languageCode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "translation_entries_translationKeyId_languageCode_key" ON "translation_entries"("translationKeyId", "languageCode");

-- AddForeignKey
ALTER TABLE "translation_entries" ADD CONSTRAINT "translation_entries_translationKeyId_fkey" FOREIGN KEY ("translationKeyId") REFERENCES "translation_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_entries" ADD CONSTRAINT "translation_entries_languageCode_fkey" FOREIGN KEY ("languageCode") REFERENCES "languages"("code") ON DELETE CASCADE ON UPDATE CASCADE;
