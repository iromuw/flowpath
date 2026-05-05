-- AlterTable
ALTER TABLE "status_history" ADD COLUMN     "scheduled_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "platform" "Platform" NOT NULL,
    "job_url" TEXT,
    "company_url" TEXT,
    "salary_range" TEXT,
    "job_type" "JobType" NOT NULL,
    "work_mode" "WorkMode" NOT NULL,
    "notes" TEXT,
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);
