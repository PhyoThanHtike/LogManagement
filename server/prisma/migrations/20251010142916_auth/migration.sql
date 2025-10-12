/*
  Warnings:

  - Changed the type of `purpose` on the `otp_requests` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."OTPPurpose" AS ENUM ('REGISTRATION', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "public"."otp_requests" DROP COLUMN "purpose",
ADD COLUMN     "purpose" "public"."OTPPurpose" NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "loginAttempts" SET DEFAULT 0;
