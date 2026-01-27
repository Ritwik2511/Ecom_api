const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the user's cart
 *     description: Retrieve the authenticated user's shopping cart with all items and product details
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's cart and items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Cart ID
 *                   example: "clx1234567890abcdef"
 *                 userId:
 *                   type: string
 *                   description: User ID
 *                   example: "clx0987654321fedcba"
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "clx1111111111111111"
 *                       productId:
 *                         type: string
 *                         example: "clx2222222222222222"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       product:
 *                         type: object
 *                         description: Product details
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "Wireless Headphones"
 *                           price:
 *                             type: number
 *                             example: 2999.99
 *                           stock:
 *                             type: integer
 *                             example: 50
 *                           description:
 *                             type: string
 *                             example: "High-quality wireless headphones"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/', async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.userId },
            include: { items: { include: { product: true } } }
        });
        res.json(cart || { items: [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add an item to the cart
 *     description: Add a product to the authenticated user's shopping cart. If the item already exists, the quantity will be incremented.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product to add
 *                 example: "clx2222222222222222"
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Quantity of the product to add
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx1234567890abcdef"
 *                 userId:
 *                   type: string
 *                   example: "clx0987654321fedcba"
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       product:
 *                         type: object
 *       400:
 *         description: Invalid input or not enough stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not enough stock"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/add', async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    try {
        // Verify user exists first
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({
                error: 'User not found. Please log in again.',
                details: 'Your authentication token contains an invalid user ID.'
            });
        }

        // Find or create cart
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // Check product
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Not enough stock' });
        }

        // Check if item exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error('Cart add error:', error);

        // Handle Prisma foreign key constraint errors
        if (error.code === 'P2003') {
            return res.status(404).json({
                error: 'User not found. Please log in again.',
                details: 'The user associated with this token does not exist in the database.'
            });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /cart/remove/{itemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     description: Remove a specific item from the authenticated user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the cart item to remove
 *         example: "clx1111111111111111"
 *     responses:
 *       200:
 *         description: Cart item removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx1234567890abcdef"
 *                 userId:
 *                   type: string
 *                   example: "clx0987654321fedcba"
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Cart or item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Item not found in cart"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete('/remove/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.userId;

    try {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        // Verify item belongs to user's cart
        const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item || item.cartId !== cart.id) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        await prisma.cartItem.delete({ where: { id: itemId } });

        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        res.json(updatedCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear the entire cart
 *     description: Remove all items from the authenticated user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cart cleared"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cart not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete('/clear', async (req, res) => {
    const userId = req.user.userId;
    try {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
