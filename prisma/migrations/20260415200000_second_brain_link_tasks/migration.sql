-- brain_notes: project -> task
ALTER TABLE "brain_notes" DROP CONSTRAINT IF EXISTS "brain_notes_project_id_fkey";
ALTER TABLE "brain_notes" DROP COLUMN IF EXISTS "project_id";
ALTER TABLE "brain_notes" ADD COLUMN "task_id" TEXT;
CREATE INDEX "brain_notes_task_id_idx" ON "brain_notes"("task_id");
ALTER TABLE "brain_notes" ADD CONSTRAINT "brain_notes_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- knowledge_articles
ALTER TABLE "knowledge_articles" DROP CONSTRAINT IF EXISTS "knowledge_articles_project_id_fkey";
ALTER TABLE "knowledge_articles" DROP COLUMN IF EXISTS "project_id";
ALTER TABLE "knowledge_articles" ADD COLUMN "task_id" TEXT;
CREATE INDEX "knowledge_articles_task_id_idx" ON "knowledge_articles"("task_id");
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- brain_templates
ALTER TABLE "brain_templates" DROP CONSTRAINT IF EXISTS "brain_templates_project_id_fkey";
ALTER TABLE "brain_templates" DROP COLUMN IF EXISTS "project_id";
ALTER TABLE "brain_templates" ADD COLUMN "task_id" TEXT;
CREATE INDEX "brain_templates_task_id_idx" ON "brain_templates"("task_id");
ALTER TABLE "brain_templates" ADD CONSTRAINT "brain_templates_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
