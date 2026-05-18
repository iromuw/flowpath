-- Migration: Replace Platform enum with JobPlatform relation

-- Step 1: Add platform_id to applications
ALTER TABLE "applications" ADD COLUMN "platform_id" TEXT;

-- Step 2: Populate platform_id by matching enum value to job_platform name (case-insensitive)
UPDATE "applications" a
SET "platform_id" = jp.id
FROM "job_platforms" jp
WHERE jp.user_id = a.user_id
  AND (
    (a.platform = 'SEEK'     AND LOWER(jp.name) = 'seek') OR
    (a.platform = 'INDEED'   AND LOWER(jp.name) = 'indeed') OR
    (a.platform = 'LINKEDIN' AND LOWER(jp.name) = 'linkedin') OR
    (a.platform = 'COMPANY'  AND LOWER(jp.name) IN ('company', 'company website'))
  );

-- Step 3: Add platform_id to saved_jobs
ALTER TABLE "saved_jobs" ADD COLUMN "platform_id" TEXT;

-- Step 4: Populate saved_jobs.platform_id the same way
UPDATE "saved_jobs" sj
SET "platform_id" = jp.id
FROM "job_platforms" jp
WHERE jp.user_id = sj.user_id
  AND (
    (sj.platform = 'SEEK'     AND LOWER(jp.name) = 'seek') OR
    (sj.platform = 'INDEED'   AND LOWER(jp.name) = 'indeed') OR
    (sj.platform = 'LINKEDIN' AND LOWER(jp.name) = 'linkedin') OR
    (sj.platform = 'COMPANY'  AND LOWER(jp.name) IN ('company', 'company website'))
  );

-- Step 5: Add foreign key constraints
ALTER TABLE "applications" ADD CONSTRAINT "applications_platform_id_fkey"
  FOREIGN KEY ("platform_id") REFERENCES "job_platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_platform_id_fkey"
  FOREIGN KEY ("platform_id") REFERENCES "job_platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 6: Drop old platform columns
ALTER TABLE "applications" DROP COLUMN "platform";
ALTER TABLE "saved_jobs" DROP COLUMN "platform";

-- Step 7: Drop Platform enum
DROP TYPE "Platform";
