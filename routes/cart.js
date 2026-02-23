const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const cartValidation = require('../validations/cartValidation');

router.use(auth);

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
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/add', validate(cartValidation.addItemSchema), cartController.addItemToCart);

/**
 * @swagger
 * /cart/remove/{itemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/remove/:itemId', validate(cartValidation.removeItemSchema), cartController.removeItemFromCart);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/clear', cartController.clearCart);

module.exports = router;
