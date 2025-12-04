-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blueprint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "coreIdea" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "toneMood" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "languageStyle" TEXT NOT NULL,
    "narration" TEXT NOT NULL,
    "sceneCount" INTEGER NOT NULL,
    "characters" TEXT[],
    "customPrompt" TEXT,
    "selectedModel" TEXT NOT NULL DEFAULT 'openrouter/default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blueprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storyText" TEXT NOT NULL,
    "wordCountActual" INTEGER NOT NULL,
    "constraintsConfirmation" TEXT NOT NULL,
    "scenes" TEXT[],
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validationErrors" JSONB,
    "selectedModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "appearance" JSONB NOT NULL,
    "outfit" JSONB NOT NULL,
    "props" TEXT[],
    "designPrompt" TEXT NOT NULL,
    "snippets" JSONB NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneIndex" INTEGER NOT NULL,
    "originalScene" TEXT NOT NULL,
    "shotType" TEXT,
    "angle" TEXT,
    "view" TEXT,
    "staging" TEXT,
    "relationalStaging" TEXT,
    "sceneFunction" TEXT,
    "backgroundBlueprint" JSONB,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sceneId" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "prompt" TEXT,
    "modelUsed" TEXT NOT NULL,
    "metadata" JSONB,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "versionData" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_provider_key" ON "ApiKey"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Blueprint_projectId_key" ON "Blueprint"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Story_projectId_key" ON "Story"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_projectId_name_key" ON "Character"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_projectId_sceneIndex_key" ON "Scene"("projectId", "sceneIndex");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blueprint" ADD CONSTRAINT "Blueprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
