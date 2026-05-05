-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'APPLICATION_VIEWED', 'FIRST_ROUND', 'SECOND_ROUND', 'FINAL_ROUND', 'OFFER', 'NO_REPLY', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('SEEK', 'INDEED', 'LINKEDIN', 'COMPANY');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'CASUAL');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "submitted_date" TIMESTAMP(3) NOT NULL,
    "current_status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "platform" "Platform" NOT NULL,
    "job_url" TEXT,
    "company_url" TEXT,
    "salary_range" TEXT,
    "job_type" "JobType" NOT NULL,
    "work_mode" "WorkMode" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
