-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "shippingName" DROP DEFAULT,
ALTER COLUMN "shippingPhone" DROP DEFAULT,
ALTER COLUMN "shippingAddressLine1" DROP DEFAULT,
ALTER COLUMN "shippingCity" DROP DEFAULT,
ALTER COLUMN "shippingState" DROP DEFAULT,
ALTER COLUMN "shippingPostalCode" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sellerId" TEXT,
ADD COLUMN     "sellerStoreName" TEXT;

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "gstNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "domainUrl" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "urlEndpoint" TEXT NOT NULL,
    "panCard" TEXT,
    "aadharCard" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountHolderName" TEXT,
    "ifscCode" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userId_key" ON "Seller"("userId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
