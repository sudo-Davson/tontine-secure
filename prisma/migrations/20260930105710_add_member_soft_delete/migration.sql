-- AlterTable
ALTER TABLE "members" ADD COLUMN     "raisonRetrait" TEXT,
ADD COLUMN     "retireLe" TIMESTAMP(3),
ADD COLUMN     "retirePar" TEXT;
