-- AlterTable
ALTER TABLE "cotisations" ADD COLUMN     "chancesRelance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dernierRappel" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "chancesUtilisees" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "derniereChanceLe" TIMESTAMP(3),
ADD COLUMN     "dette" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "retireAutomatique" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tontines" ADD COLUMN     "dureeChanceJours" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "nombreChancesMax" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "tours" ADD COLUMN     "clotureLe" TIMESTAMP(3),
ADD COLUMN     "clotureParAdmin" BOOLEAN NOT NULL DEFAULT false;
