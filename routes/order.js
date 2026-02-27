const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { auth } = require('../middleware/auth');
const { getPaymentConfig } = require('../utils/paymentService');

router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /orders/checkout:
 *   get:
 *     summary: Review checkout details (Get order summary)
 *     description: Get a summary of the cart items and total price before placing an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "Wireless Headphones"
 *                           price:
 *                             type: number
 *                             example: 2999.99
 *                           description:
 *                             type: string
 *                       itemTotal:
 *                         type: number
 *                         description: Total price for this item (price * quantity)
 *                         example: 5999.98
 *                 total:
 *                   type: number
 *                   description: Total price for all items in cart
 *                   example: 5999.98
 *       400:
 *         description: Cart is empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Cart is empty"
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
router.get('/checkout', async (req, res) => {
    const userId = req.user.userId;

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let total = 0;
        const summaryItems = cart.items.map(item => {
            const price = Number(item.product.price);
            const itemTotal = price * item.quantity;
            total += itemTotal;
            return {
                ...item,
                itemTotal
            };
        });

        res.json({ items: summaryItems, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (Checkout)
 *     description: Create a new order from the user's cart items with shipping address details. The cart will be cleared after successful order creation.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingName
 *               - shippingPhone
 *               - shippingAddressLine1
 *               - shippingCity
 *               - shippingState
 *               - shippingPostalCode
 *             properties:
 *               shippingName:
 *                 type: string
 *                 description: Recipient's full name
 *                 example: "John Doe"
 *               shippingPhone:
 *                 type: string
 *                 description: Recipient's contact phone number
 *                 example: "+91 9876543210"
 *               shippingAddressLine1:
 *                 type: string
 *                 description: Primary address line (street, building, apartment)
 *                 example: "123 Main Street, Apartment 4B"
 *               shippingAddressLine2:
 *                 type: string
 *                 description: Secondary address line (optional - landmarks, area)
 *                 example: "Near City Mall"
 *               shippingCity:
 *                 type: string
 *                 description: City name
 *                 example: "Mumbai"
 *               shippingState:
 *                 type: string
 *                 description: State or province name
 *                 example: "Maharashtra"
 *               shippingPostalCode:
 *                 type: string
 *                 description: Postal/ZIP code
 *                 example: "400001"
 *               shippingCountry:
 *                 type: string
 *                 default: "India"
 *                 description: Country name (defaults to India)
 *                 example: "India"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx3333333333333333"
 *                 userId:
 *                   type: string
 *                   example: "clx0987654321fedcba"
 *                 total:
 *                   type: number
 *                   example: 5999.98
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PROCESS, SHIPPED, DELIVERED, CANCELLED]
 *                   example: "PENDING"
 *                 shippingName:
 *                   type: string
 *                   example: "John Doe"
 *                 shippingPhone:
 *                   type: string
 *                   example: "+91 9876543210"
 *                 shippingAddressLine1:
 *                   type: string
 *                   example: "123 Main Street, Apartment 4B"
 *                 shippingAddressLine2:
 *                   type: string
 *                   nullable: true
 *                   example: "Near City Mall"
 *                 shippingCity:
 *                   type: string
 *                   example: "Mumbai"
 *                 shippingState:
 *                   type: string
 *                   example: "Maharashtra"
 *                 shippingPostalCode:
 *                   type: string
 *                   example: "400001"
 *                 shippingCountry:
 *                   type: string
 *                   example: "India"
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
 *                       price:
 *                         type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 paymentGateway:
 *                   type: object
 *                   properties:
 *                     mode:
 *                       type: string
 *                       enum: [CUSTOM, PLATFORM]
 *                     clientId:
 *                       type: string
 *                     webhookUrl:
 *                       type: string
 *       400:
 *         description: Cart is empty or not enough stock or missing address fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required shipping address fields"
 *                 required:
 *                   type: array
 *                   items:
 *                     type: string
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
router.post('/', async (req, res) => {
    const userId = req.user.userId;
    const {
        shippingName,
        shippingPhone,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry = 'India'
    } = req.body;

    // Validate required address fields
    if (!shippingName || !shippingPhone || !shippingAddressLine1 || !shippingCity || !shippingState || !shippingPostalCode) {
        return res.status(400).json({
            error: 'Missing required shipping address fields',
            required: ['shippingName', 'shippingPhone', 'shippingAddressLine1', 'shippingCity', 'shippingState', 'shippingPostalCode']
        });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        let total = 0;
        const orderItemsData = [];

        // Validate stock and calculate total
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${item.product.name}` });
            }
            // Handle Decimal to Number conversion safely for calculation
            const price = Number(item.product.price);
            total += price * item.quantity;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price // Pass Decimal directly to Prisma
            });
        }

        const subtotal = total;
        const shippingCost = 50; // Fixed shipping cost
        const tax = subtotal * 0.09; // 9% Tax
        const finalTotal = subtotal + shippingCost + tax;

        // Determine Payment Configuration
        // Logic: If all items belong to one seller, try to use their PG. 
        // If items are from multiple sellers, default to Platform PG.
        const sellerIds = [...new Set(cart.items.map(item => item.product.sellerId))];
        let pgConfig = null;

        if (sellerIds.length === 1 && sellerIds[0]) {
            pgConfig = await getPaymentConfig(sellerIds[0]);
        } else {
            // Multi-vendor or unknown seller: use Platform PG
            pgConfig = await getPaymentConfig(null);
        }

        const order = await prisma.$transaction(async (tx) => {
            // Create Order with shipping address
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total: finalTotal,
                    tax: tax,
                    shippingCost: shippingCost,
                    status: 'PENDING',
                    shippingName,
                    shippingPhone,
                    shippingAddressLine1,
                    shippingAddressLine2: shippingAddressLine2 || null,
                    shippingCity,
                    shippingState,
                    shippingPostalCode,
                    shippingCountry,
                    items: {
                        create: orderItemsData
                    }
                },
                include: { items: true }
            });

            // Update Stock
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Clear Cart
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        });

        // Add payment session info (only return non-sensitive data to frontend)
        res.status(201).json({
            ...order,
            paymentGateway: {
                mode: pgConfig.mode,
                clientId: pgConfig.clientId,
                // Note: Never return secretKey or encryptionKey to the frontend!
                // These will be used for server-to-server calls or signing requests.
                webhookUrl: pgConfig.webhookUrl
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get user orders
 *     description: Retrieve all orders for the authenticated user with optional filtering and pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PROCESS, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter orders by status
 *         example: "PENDING"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Number of orders to return (max 100)
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "clx3333333333333333"
 *                   userId:
 *                     type: string
 *                     example: "clx0987654321fedcba"
 *                   total:
 *                     type: number
 *                     example: 5999.98
 *                   status:
 *                     type: string
 *                     enum: [PENDING, PROCESS, SHIPPED, DELIVERED, CANCELLED]
 *                     example: "PENDING"
 *                   shippingName:
 *                     type: string
 *                     example: "John Doe"
 *                   shippingPhone:
 *                     type: string
 *                     example: "+91 9876543210"
 *                   shippingAddressLine1:
 *                     type: string
 *                     example: "123 Main Street, Apartment 4B"
 *                   shippingAddressLine2:
 *                     type: string
 *                     nullable: true
 *                     example: "Near City Mall"
 *                   shippingCity:
 *                     type: string
 *                     example: "Mumbai"
 *                   shippingState:
 *                     type: string
 *                     example: "Maharashtra"
 *                   shippingPostalCode:
 *                     type: string
 *                     example: "400001"
 *                   shippingCountry:
 *                     type: string
 *                     example: "India"
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         productId:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                         price:
 *                           type: number
 *                         product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                               example: "Wireless Headphones"
 *                             price:
 *                               type: number
 *                               example: 2999.99
 *                             description:
 *                               type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
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
    const userId = req.user.userId;
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     description: Retrieve detailed information about a specific order including all items and shipping details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order to retrieve
 *         example: "clx3333333333333333"
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "clx3333333333333333"
 *                 userId:
 *                   type: string
 *                   example: "clx0987654321fedcba"
 *                 total:
 *                   type: number
 *                   example: 5999.98
 *                 status:
 *                   type: string
 *                   enum: [PENDING, PROCESS, SHIPPED, DELIVERED, CANCELLED]
 *                   example: "PENDING"
 *                 shippingName:
 *                   type: string
 *                   example: "John Doe"
 *                 shippingPhone:
 *                   type: string
 *                   example: "+91 9876543210"
 *                 shippingAddressLine1:
 *                   type: string
 *                   example: "123 Main Street, Apartment 4B"
 *                 shippingAddressLine2:
 *                   type: string
 *                   nullable: true
 *                   example: "Near City Mall"
 *                 shippingCity:
 *                   type: string
 *                   example: "Mumbai"
 *                 shippingState:
 *                   type: string
 *                   example: "Maharashtra"
 *                 shippingPostalCode:
 *                   type: string
 *                   example: "400001"
 *                 shippingCountry:
 *                   type: string
 *                   example: "India"
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
 *                       price:
 *                         type: number
 *                       product:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                             example: "Wireless Headphones"
 *                           price:
 *                             type: number
 *                             example: 2999.99
 *                           description:
 *                             type: string
 *                           stock:
 *                             type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Order not found"
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
router.get('/:orderId', async (req, res) => {
    const userId = req.user.userId;
    const { orderId } = req.params;
    try {
        const order = await prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: { include: { product: true } } }
        });

        if (!order) return res.status(404).json({ error: 'Order not found' });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
