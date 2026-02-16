const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Public product browsing for customers
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (Home Page API)
 *     description: Retrieve a list of all products available for purchase. This is the main API for the home page.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
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
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   imageUrl:
 *                     type: string
 *                   sellerStoreName:
 *                     type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                stock: {
                    gt: 0 // Only show available products
                }
            },
            include: {
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(products);
    } catch (error) {
        console.error('Fetch all products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details
 *     description: Retrieve detailed information about a specific product.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        name: true
                    }
                },
                seller: {
                    select: {
                        businessName: true,
                        address: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Fetch product details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
