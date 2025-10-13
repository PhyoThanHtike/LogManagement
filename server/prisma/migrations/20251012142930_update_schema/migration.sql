-- CreateEnum
CREATE TYPE "public"."LogSources" AS ENUM ('FIREWALL', 'API', 'CROWDSTRIKE', 'AWS', 'M365', 'AD', 'NETWORK');

-- CreateEnum
CREATE TYPE "public"."Action" AS ENUM ('ALLOW', 'DENY', 'CREATE', 'DELETE', 'UPDATE', 'ALERT', 'LOGIN', 'QUARANTINE', 'BLOCK');

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
    "ruleId" TEXT,
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

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "public"."alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_logId_fkey" FOREIGN KEY ("logId") REFERENCES "public"."logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
