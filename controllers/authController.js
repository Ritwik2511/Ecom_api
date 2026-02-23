const asyncHandler = require('express-async-handler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, ...result });
});

const getMe = asyncHandler(async (req, res) => {
    // User is already attached by auth middleware
    res.json({ success: true, data: req.user });
});

module.exports = {
    register,
    login,
    getMe,
};
