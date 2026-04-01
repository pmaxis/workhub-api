-- AlterTable: add denormalized project scope (nullable first for backfill)
ALTER TABLE "tasks" ADD COLUMN "project_company_id" TEXT;
ALTER TABLE "tasks" ADD COLUMN "project_owner_id" TEXT;

-- Backfill from projects
UPDATE "tasks" AS t
SET
  "project_owner_id" = p."owner_id",
  "project_company_id" = p."company_id"
FROM "projects" AS p
WHERE t."project_id" = p."id";

-- Enforce NOT NULL on project_owner_id (every task must belong to a project)
ALTER TABLE "tasks" ALTER COLUMN "project_owner_id" SET NOT NULL;
