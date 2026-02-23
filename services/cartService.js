const prisma = require('../prismaClient');
const { NotFoundError, BadRequestError } = require('../utils/errors');

const getCart = async (userId) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
    });
    return cart || { items: [] };
};

const addItemToCart = async (userId, productId, quantity) => {
    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    // Check product and stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundError('Product not found');
    if (product.stock < quantity) throw new BadRequestError('Not enough stock');

    // Find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if item exists in cart
    const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });

    if (existingItem) {
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
        });
    }

    return getCart(userId);
};

const removeItemFromCart = async (userId, itemId) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundError('Cart not found');

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
        throw new NotFoundError('Item not found in cart');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return getCart(userId);
};

const clearCart = async (userId) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundError('Cart not found');

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return { message: 'Cart cleared' };
};

module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    clearCart,
};
