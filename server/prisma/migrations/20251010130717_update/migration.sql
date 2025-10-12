/*
  Warnings:

  - You are about to drop the `allowed_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance_records` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `loginAttempts` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Tenant" AS ENUM ('TENANT1', 'TENANT2', 'TENANT3', 'TENANT4');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'RESTRICTED');

-- DropForeignKey
ALTER TABLE "public"."attendance_records" DROP CONSTRAINT "attendance_records_userId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "loginAttempts" INTEGER NOT NULL,
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tenant" "public"."Tenant" NOT NULL;

-- DropTable
DROP TABLE "public"."allowed_locations";

-- DropTable
DROP TABLE "public"."attendance_records";

-- DropEnum
DROP TYPE "public"."RecordType";

-- CreateTable
CREATE TABLE "public"."otp_requests" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpCode" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_requests_pkey" PRIMARY KEY ("id")
);
