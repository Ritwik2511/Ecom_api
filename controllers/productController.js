const asyncHandler = require('express-async-handler');
const productService = require('../services/productService');
const { NotFoundError } = require('../utils/errors');

const getProducts = asyncHandler(async (req, res) => {
    const { categoryId, sellerId, search } = req.query;
    const products = await productService.getAllProducts({ categoryId, sellerId, search });
    res.json({ success: true, data: products });
});

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    if (!product) throw new NotFoundError('Product not found');
    res.json({ success: true, data: product });
});

module.exports = {
    getProducts,
    getProduct,
};
