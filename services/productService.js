const prisma = require('../prismaClient');

const getAllProducts = async (filters = {}) => {
    const { categoryId, sellerId, search } = filters;

    return prisma.product.findMany({
        where: {
            ...(categoryId && { categoryId }),
            ...(sellerId && { sellerId }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        },
        include: {
            category: { select: { name: true } },
            seller: { select: { businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getProductById = async (id) => {
    return prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { name: true } },
            seller: { select: { businessName: true } },
        },
    });
};

module.exports = {
    getAllProducts,
    getProductById,
};
