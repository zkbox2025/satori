-- CreateEnum
CREATE TYPE "ContentStyle" AS ENUM ('POEM');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedText" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "style" "ContentStyle" NOT NULL,
    "modelName" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,

    CONSTRAINT "WorkLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedContentLike" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "generatedContentId" TEXT NOT NULL,

    CONSTRAINT "GeneratedContentLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Work_userId_idx" ON "Work"("userId");

-- CreateIndex
CREATE INDEX "Work_userId_status_visibility_idx" ON "Work"("userId", "status", "visibility");

-- CreateIndex
CREATE INDEX "Work_status_visibility_createdAt_idx" ON "Work"("status", "visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_workId_idx" ON "Feedback"("workId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_workId_key" ON "Feedback"("workId");

-- CreateIndex
CREATE INDEX "GeneratedContent_workId_idx" ON "GeneratedContent"("workId");

-- CreateIndex
CREATE INDEX "GeneratedContent_userId_idx" ON "GeneratedContent"("userId");

-- CreateIndex
CREATE INDEX "GeneratedContent_userId_visibility_idx" ON "GeneratedContent"("userId", "visibility");

-- CreateIndex
CREATE INDEX "GeneratedContent_visibility_createdAt_idx" ON "GeneratedContent"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "WorkLike_workId_idx" ON "WorkLike"("workId");

-- CreateIndex
CREATE INDEX "WorkLike_userId_idx" ON "WorkLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkLike_userId_workId_key" ON "WorkLike"("userId", "workId");

-- CreateIndex
CREATE INDEX "GeneratedContentLike_generatedContentId_idx" ON "GeneratedContentLike"("generatedContentId");

-- CreateIndex
CREATE INDEX "GeneratedContentLike_userId_idx" ON "GeneratedContentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedContentLike_userId_generatedContentId_key" ON "GeneratedContentLike"("userId", "generatedContentId");

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLike" ADD CONSTRAINT "WorkLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkLike" ADD CONSTRAINT "WorkLike_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContentLike" ADD CONSTRAINT "GeneratedContentLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedContentLike" ADD CONSTRAINT "GeneratedContentLike_generatedContentId_fkey" FOREIGN KEY ("generatedContentId") REFERENCES "GeneratedContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
