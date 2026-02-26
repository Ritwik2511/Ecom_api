const asyncHandler = require('express-async-handler');
const adminService = require('../services/adminService');

const getCustomers = asyncHandler(async (req, res) => {
    const customers = await adminService.getAllCustomers();
    res.json({ success: true, data: customers });
});

const getOrders = asyncHandler(async (req, res) => {
    const orders = await adminService.getAllOrders();
    res.json({ success: true, data: orders });
});

const getOrderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const order = await adminService.getOrderDetails(id);
    res.json({ success: true, data: order });
});

const getCategories = asyncHandler(async (req, res) => {
    const categories = await adminService.getAllCategories();
    res.json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
    const category = await adminService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await adminService.updateCategory(id, req.body);
    res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await adminService.deleteCategory(id);
    res.json({ success: true, message: 'Category deleted successfully' });
});

module.exports = {
    getCustomers,
    getOrders,
    getOrderDetails,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
