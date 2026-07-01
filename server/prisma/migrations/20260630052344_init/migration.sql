-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "studyLevel" TEXT NOT NULL DEFAULT 'N5',
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "lastStudied" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT,
    "example" TEXT,
    "exampleTl" TEXT,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanjiEntry" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "onReadings" TEXT[],
    "kunReadings" TEXT[],
    "meaning" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "strokeCount" INTEGER,

    CONSTRAINT "KanjiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammarPattern" (
    "id" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "structure" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "examples" JSONB NOT NULL,
    "note" TEXT,

    CONSTRAINT "GrammarPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vocabularyId" TEXT,
    "kanjiId" TEXT,
    "cardType" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "nextReview" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mastery" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "KanjiEntry_character_key" ON "KanjiEntry"("character");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardReview_userId_vocabularyId_key" ON "FlashcardReview"("userId", "vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardReview_userId_kanjiId_key" ON "FlashcardReview"("userId", "kanjiId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_level_category_key" ON "UserProgress"("userId", "level", "category");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- AddForeignKey
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_kanjiId_fkey" FOREIGN KEY ("kanjiId") REFERENCES "KanjiEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonHistory" ADD CONSTRAINT "LessonHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
