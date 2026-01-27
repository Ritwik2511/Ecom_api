-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingAddressLine1" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingAddressLine2" TEXT,
ADD COLUMN     "shippingCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingState" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingPostalCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "shippingCountry" TEXT NOT NULL DEFAULT 'India';
