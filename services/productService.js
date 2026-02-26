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
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true } },
            seller: { select: { id: true, businessName: true } },
        },
    });

    if (product && product.categoryId) {
        const relatedProducts = await prisma.product.findMany({
            where: {
                categoryId: product.categoryId,
                NOT: { id: product.id },
            },
            take: 4,
            include: {
                category: { select: { name: true } },
            },
        });
        return { ...product, relatedProducts };
    }

    return product;
};

module.exports = {
    getAllProducts,
    getProductById,
};
