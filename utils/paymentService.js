const prisma = require('../prismaClient');

/**
 * Resolves the Payment Gateway context for a given seller.
 * If the seller has their own PG configured and 'usePlatformPG' is false, it returns seller's keys.
 * Otherwise, it returns the platform's default PG keys from environment variables.
 * 
 * @param {string} sellerId - The unique ID of the seller
 * @returns {Promise<Object>} PG Configuration object
 */
const getPaymentConfig = async (sellerId) => {
    try {
        if (!sellerId) {
            return {
                mode: 'PLATFORM',
                clientId: process.env.PLATFORM_PG_CLIENT_ID,
                secretKey: process.env.PLATFORM_PG_SECRET_KEY,
                encryptionKey: process.env.PLATFORM_PG_ENCRYPTION_KEY,
                webhookUrl: process.env.PLATFORM_PG_WEBHOOK_URL,
                sellerId: 'PLATFORM'
            };
        }

        const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            select: {
                usePlatformPG: true,
                pgClientId: true,
                pgSecretKey: true,
                pgEncryptionKey: true,
                pgWebhookUrl: true
            }
        });

        // Case 1: Seller has their own PG and choose to use it
        if (seller && !seller.usePlatformPG && seller.pgClientId) {
            return {
                mode: 'CUSTOM',
                clientId: seller.pgClientId,
                secretKey: seller.pgSecretKey,
                encryptionKey: seller.pgEncryptionKey,
                webhookUrl: seller.pgWebhookUrl,
                sellerId: sellerId
            };
        }

        // Case 2: Use Platform (Admin) default PG
        return {
            mode: 'PLATFORM',
            clientId: process.env.PLATFORM_PG_CLIENT_ID,
            secretKey: process.env.PLATFORM_PG_SECRET_KEY,
            encryptionKey: process.env.PLATFORM_PG_ENCRYPTION_KEY,
            webhookUrl: process.env.PLATFORM_PG_WEBHOOK_URL,
            sellerId: 'PLATFORM'
        };
    } catch (error) {
        console.error('Error resolving payment config:', error);
        throw new Error('Could not resolve payment gateway configuration');
    }
};

module.exports = {
    getPaymentConfig
};
