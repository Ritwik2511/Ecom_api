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

module.exports = {
    getCustomers,
    getOrders,
    getOrderDetails,
};
