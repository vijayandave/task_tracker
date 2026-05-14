-- CreateTable
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "task_tags" (
    "taskId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "task_tags_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("taskId", "tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tags_userId_name_key" ON "tags"("userId", "name");

-- Migrate existing priority values to hashtags
-- First, create priority tags for all users who have tasks
INSERT INTO "tags" ("id", "userId", "name", "createdAt")
SELECT 
    lower(hex(randomblob(16))) as id,
    DISTINCT "userId",
    'low' as name,
    CURRENT_TIMESTAMP
FROM "tasks"
WHERE "priority" = 'LOW'
GROUP BY "userId"
ON CONFLICT DO NOTHING;

INSERT INTO "tags" ("id", "userId", "name", "createdAt")
SELECT 
    lower(hex(randomblob(16))) as id,
    DISTINCT "userId",
    'medium' as name,
    CURRENT_TIMESTAMP
FROM "tasks"
WHERE "priority" = 'MEDIUM'
GROUP BY "userId"
ON CONFLICT DO NOTHING;

INSERT INTO "tags" ("id", "userId", "name", "createdAt")
SELECT 
    lower(hex(randomblob(16))) as id,
    DISTINCT "userId",
    'high' as name,
    CURRENT_TIMESTAMP
FROM "tasks"
WHERE "priority" = 'HIGH'
GROUP BY "userId"
ON CONFLICT DO NOTHING;

-- Link tasks to their priority tags
INSERT INTO "task_tags" ("taskId", "tagId")
SELECT 
    t."id" as "taskId",
    tag."id" as "tagId"
FROM "tasks" t
JOIN "tags" tag ON tag."userId" = t."userId" AND tag."name" = lower(t."priority")
ON CONFLICT DO NOTHING;

-- Drop the priority column
-- Note: SQLite doesn't support DROP COLUMN directly, so we'll need to recreate the table
-- For now, we'll leave it but it won't be used
