const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

// Apply auth and admin check to all admin routes
router.use(auth, authorize('ADMIN'));

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
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/customers', adminController.getCustomers);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/orders', adminController.getOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/orders/:id', adminController.getOrderDetails);

// Note: Other admin routes (products, categories) should be refactored similar to the above.

module.exports = router;
