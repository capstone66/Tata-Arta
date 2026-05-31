-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stokMax" INTEGER,
ADD COLUMN     "stokMin" INTEGER,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "trxCount" INTEGER,
ADD COLUMN     "trxQty30d" INTEGER,
ADD COLUMN     "trxQty90d" INTEGER,
ADD COLUMN     "trxTotalProfit" DOUBLE PRECISION,
ADD COLUMN     "trxTotalQty" INTEGER,
ADD COLUMN     "trxTotalRevenue" DOUBLE PRECISION;
