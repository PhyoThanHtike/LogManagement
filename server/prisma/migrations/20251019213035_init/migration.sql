-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "public"."Tenant" AS ENUM ('TENANT1', 'TENANT2', 'TENANT3', 'TENANT4');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "public"."OTPPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."LogSources" AS ENUM ('FIREWALL', 'API', 'CROWDSTRIKE', 'AWS', 'M365', 'AD', 'NETWORK');

-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('ALLOW', 'DENY', 'CREATE', 'DELETE', 'UPDATE', 'ALERT', 'LOGIN', 'QUARANTINE', 'BLOCK');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "tenant" "public"."Tenant" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "tenant" "public"."Tenant" NOT NULL,
    "source" "public"."LogSources" NOT NULL,
    "vendor" TEXT,
    "product" TEXT,
    "eventType" TEXT NOT NULL,
    "eventSubtype" TEXT,
    "severity" INTEGER,
    "srcIp" TEXT,
    "srcPort" INTEGER,
    "dstIp" TEXT,
    "dstPort" INTEGER,
    "protocol" TEXT,
    "user" TEXT,
    "host" TEXT,
    "process" TEXT,
    "url" TEXT,
    "httpMethod" TEXT,
    "statusCode" TEXT,
    "ruleName" TEXT,
    "cloud_account_id" TEXT,
    "cloud_region" TEXT,
    "cloud_service" TEXT,
    "action" "public"."Action",
    "reason" TEXT,
    "raw" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alert_rules" (
    "id" TEXT NOT NULL,
    "tenant" "public"."Tenant" NOT NULL,
    "ruleName" TEXT NOT NULL,
    "logSource" "public"."LogSources" NOT NULL,
    "severity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "tenant" "public"."Tenant" NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "ruleName" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "description" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "purpose" "public"."OTPPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");
