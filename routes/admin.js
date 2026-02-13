const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management routes
 */

/**
 * @swagger
 * /admin/customers:
 *   get:
 *     summary: Get all customers
 *     description: Retrieve a list of all customers (BUYER role) with their order statistics. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   totalOrders:
 *                     type: integer
 *                   totalSpent:
 *                     type: number
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/customers', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const customers = await prisma.user.findMany({
            where: { role: 'BUYER' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                orders: {
                    select: {
                        total: true
                    }
                },
                _count: {
                    select: { orders: true }
                }
            }
        });

        const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            joinedAt: customer.createdAt,
            totalOrders: customer._count.orders,
            totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0)
        }));

        res.json(formattedCustomers);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve a list of all orders with customer details. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   customerName:
 *                     type: string
 *                   customerEmail:
 *                     type: string
 *                   vendor:
 *                     type: string
 *                     description: Mocked as Multi-Vendor for now
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   total:
 *                     type: number
 *                   paymentStatus:
 *                     type: string
 *                   status:
 *                     type: string
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: {
                            include: {
                                seller: {
                                    select: {
                                        businessName: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedOrders = orders.map(order => {
            // Aggregate unique vendor names
            const vendors = new Set();
            order.items.forEach(item => {
                if (item.product?.seller?.businessName) {
                    vendors.add(item.product.seller.businessName);
                }
            });
            const vendorName = vendors.size > 0 ? Array.from(vendors).join(', ') : 'Unknown Vendor';

            return {
                id: order.id,
                customerName: order.user?.name || 'Unknown',
                customerEmail: order.user?.email || 'Unknown',
                vendor: vendorName,
                date: order.createdAt,
                total: Number(order.total),
                paymentStatus: order.status === 'PAID' ? 'Paid' : 'Pending',
                status: order.status
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order details
 *     description: Retrieve detailed information about a specific order including items, customer info, and shipping details. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       sku:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *                 paymentInfo:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                     status:
 *                       type: string
 *                     transactionId:
 *                       type: string
 *                 pricing:
 *                   type: object
 *                   properties:
 *                     subtotal:
 *                       type: number
 *                     tax:
 *                       type: number
 *                     shipping:
 *                       type: number
 *                     total:
 *                       type: number
 *                 customer:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                 shippingAddress:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zip:
 *                       type: string
 *                     country:
 *                       type: string
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: {
                            include: {
                                seller: {
                                    select: {
                                        businessName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Calculate pricing
        const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const shipping = Number(order.shippingCost) || 0;
        const tax = Number(order.tax) || 0;
        const total = Number(order.total);

        // Mock Transaction ID
        const transactionId = `TXN${Date.now().toString().slice(-8)}`;

        const orderDetails = {
            id: order.id,
            items: order.items.map(item => ({
                name: item.product.name,
                vendor: item.product.seller?.businessName || 'Unknown',
                sku: item.productId.substring(0, 8).toUpperCase(), // Mock SKU from ID
                quantity: item.quantity,
                price: Number(item.price),
                image: item.product.imageUrl
            })),
            paymentInfo: {
                method: 'Card', // Mock method
                status: order.status,
                transactionId: transactionId
            },
            pricing: {
                subtotal: subtotal,
                tax: tax,
                shipping: shipping,
                total: total
            },
            customer: {
                name: order.user.name,
                email: order.user.email,
                phone: order.user.phone
            },
            shippingAddress: {
                name: order.shippingName,
                phone: order.shippingPhone,
                addressLine1: order.shippingAddressLine1,
                addressLine2: order.shippingAddressLine2,
                city: order.shippingCity,
                state: order.shippingState,
                zip: order.shippingPostalCode,
                country: order.shippingCountry
            }
        };

        res.json(orderDetails);
    } catch (error) {
        console.error('Get order details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products with seller details. Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   sellerName:
 *                     type: string
 *                   sellerStoreName:
 *                     type: string
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/products', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const products = await prisma.product.findMany({
            include: {
                seller: {
                    select: {
                        businessName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            stock: product.stock,
            // sellerName: product.seller?.businessName || 'Unknown Seller',
            sellerStoreName: product.sellerStoreName
        }));


        res.json(formattedProducts);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /admin/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update product details (price, stock, etc.). Admin only.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               sellerStoreName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put('/products/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const { name, price, stock, description, imageUrl, sellerStoreName } = req.body;

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: name !== undefined ? name : product.name,
                price: price !== undefined ? price : product.price,
                stock: stock !== undefined ? stock : product.stock,
                description: description !== undefined ? description : product.description,
                imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
                sellerStoreName: sellerStoreName !== undefined ? sellerStoreName : product.sellerStoreName
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
