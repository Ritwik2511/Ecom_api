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

/**
* @swagger
* /admin/categories:
*   get:
*     summary: Get all categories
*     tags: [Admin]
*     security:
*       - bearerAuth: []
*   post:
*     summary: Create a new category
*     tags: [Admin]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required: [name]
*             properties:
*               name: { type: string }
*               description: { type: string }
*               sellerIds: { type: array, items: { type: string }, description: "List of Seller IDs to assign this category to" }
*/
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);

/**
 * @swagger
 * /admin/categories/{id}:
 *   put:
 *     summary: Update a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               sellerIds: { type: array, items: { type: string }, description: "List of Seller IDs to assign this category to (replaces previous)" }
 *   delete:
 *     summary: Delete a category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Note: Other admin routes should be refactored similar to the above.

module.exports = router;
