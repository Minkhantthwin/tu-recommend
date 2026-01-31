/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('BUDDHIST', 'CHRISTIAN', 'HINDU', 'ISLAM', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "nameMyanmar" TEXT NOT NULL,
    "nameEnglish" TEXT NOT NULL,
    "nrc" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "religion" "Religion" NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Myanmar',
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "phone" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "permanentAddress" TEXT NOT NULL,
    "permanentTownship" TEXT NOT NULL,
    "permanentRegion" TEXT NOT NULL,
    "currentAddress" TEXT,
    "currentTownship" TEXT,
    "currentRegion" TEXT,
    "fatherName" TEXT NOT NULL,
    "fatherNrc" TEXT,
    "fatherOccupation" TEXT,
    "fatherPhone" TEXT,
    "motherName" TEXT NOT NULL,
    "motherNrc" TEXT,
    "motherOccupation" TEXT,
    "motherPhone" TEXT,
    "guardianName" TEXT,
    "guardianRelation" TEXT,
    "guardianPhone" TEXT,
    "guardianAddress" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInterest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "interestId" INTEGER NOT NULL,

    CONSTRAINT "UserInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatriculationResult" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "examYear" INTEGER NOT NULL,
    "rollNumber" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolTownship" TEXT NOT NULL,
    "schoolRegion" TEXT NOT NULL,
    "myanmar" INTEGER NOT NULL,
    "english" INTEGER NOT NULL,
    "mathematics" INTEGER NOT NULL,
    "physics" INTEGER NOT NULL,
    "chemistry" INTEGER NOT NULL,
    "biology" INTEGER,
    "totalScore" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL DEFAULT 600,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatriculationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameMyanmar" TEXT,
    "code" TEXT,
    "location" TEXT NOT NULL,
    "region" TEXT,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" SERIAL NOT NULL,
    "universityId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameMyanmar" TEXT,
    "code" TEXT,
    "description" TEXT,
    "minScore" INTEGER NOT NULL,
    "quota" INTEGER,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramRequirement" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "myanmar" INTEGER,
    "english" INTEGER,
    "mathematics" INTEGER,
    "physics" INTEGER,
    "chemistry" INTEGER,
    "biology" INTEGER,
    "minTotalScore" INTEGER,

    CONSTRAINT "ProgramRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationNumber" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "firstChoiceId" INTEGER NOT NULL,
    "secondChoiceId" INTEGER,
    "thirdChoiceId" INTEGER,
    "acceptedProgramId" INTEGER,
    "declarationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "declarationDate" TIMESTAMP(3),
    "photoUrl" TEXT,
    "nrcFrontUrl" TEXT,
    "nrcBackUrl" TEXT,
    "matricCertificateUrl" TEXT,
    "recommendationUrl" TEXT,
    "remarks" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_nrc_key" ON "UserProfile"("nrc");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_name_key" ON "Interest"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserInterest_userId_interestId_key" ON "UserInterest"("userId", "interestId");

-- CreateIndex
CREATE UNIQUE INDEX "MatriculationResult_userId_key" ON "MatriculationResult"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationNumber_key" ON "Application"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_firstChoiceId_key" ON "Application"("userId", "firstChoiceId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInterest" ADD CONSTRAINT "UserInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatriculationResult" ADD CONSTRAINT "MatriculationResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRequirement" ADD CONSTRAINT "ProgramRequirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_firstChoiceId_fkey" FOREIGN KEY ("firstChoiceId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_secondChoiceId_fkey" FOREIGN KEY ("secondChoiceId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_thirdChoiceId_fkey" FOREIGN KEY ("thirdChoiceId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_acceptedProgramId_fkey" FOREIGN KEY ("acceptedProgramId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
