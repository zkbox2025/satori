-- CreateEnum
CREATE TYPE "AiStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "costUsdMicro" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "inputSnapshot" JSONB,
ADD COLUMN     "modelName" TEXT,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "promptVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "providerRequestId" TEXT,
ADD COLUMN     "resultJson" JSONB,
ADD COLUMN     "status" "AiStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tokensInput" INTEGER,
ADD COLUMN     "tokensOutput" INTEGER;

-- AlterTable
ALTER TABLE "GeneratedContent" ADD COLUMN     "costUsdMicro" INTEGER,
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "inputSnapshot" JSONB,
ADD COLUMN     "prompt" TEXT,
ADD COLUMN     "promptVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "providerRequestId" TEXT,
ADD COLUMN     "resultJson" JSONB,
ADD COLUMN     "status" "AiStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tokensInput" INTEGER,
ADD COLUMN     "tokensOutput" INTEGER,
ALTER COLUMN "modelName" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_status_updatedAt_idx" ON "Feedback"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "GeneratedContent_status_createdAt_idx" ON "GeneratedContent"("status", "createdAt");
