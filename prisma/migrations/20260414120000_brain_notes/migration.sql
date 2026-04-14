-- CreateTable
CREATE TABLE "brain_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brain_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brain_notes_user_id_updated_at_idx" ON "brain_notes"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "brain_notes" ADD CONSTRAINT "brain_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brain_notes" ADD CONSTRAINT "brain_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
