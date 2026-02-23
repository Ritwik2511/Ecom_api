const asyncHandler = require('express-async-handler');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.userId);
    res.json({ success: true, data: cart });
});

const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItemToCart(req.user.userId, productId, quantity);
    res.json({ success: true, data: cart });
});

const removeItemFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const cart = await cartService.removeItemFromCart(req.user.userId, itemId);
    res.json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
    const result = await cartService.clearCart(req.user.userId);
    res.json({ success: true, ...result });
});

module.exports = {
    getCart,
    addItemToCart,
    removeItemFromCart,
    clearCart,
};
