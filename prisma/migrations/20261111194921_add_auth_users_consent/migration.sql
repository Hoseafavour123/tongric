-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'BUYER', 'TRANSPORT_PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS_AND_PRIVACY', 'OPTIONAL_UPDATES');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferredLanguageCode" TEXT NOT NULL DEFAULT 'en',
    "assistedByUserId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" "ConsentType" NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "locale" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recovery_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recovery_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_accountStatus_idx" ON "users"("role", "accountStatus");

-- CreateIndex
CREATE INDEX "users_preferredLanguageCode_idx" ON "users"("preferredLanguageCode");

-- CreateIndex
CREATE INDEX "users_assistedByUserId_idx" ON "users"("assistedByUserId");

-- CreateIndex
CREATE INDEX "consent_records_userId_consentType_idx" ON "consent_records"("userId", "consentType");

-- CreateIndex
CREATE INDEX "consent_records_policyVersion_idx" ON "consent_records"("policyVersion");

-- CreateIndex
CREATE INDEX "recovery_codes_userId_isUsed_idx" ON "recovery_codes"("userId", "isUsed");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_assistedByUserId_fkey" FOREIGN KEY ("assistedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recovery_codes" ADD CONSTRAINT "recovery_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
