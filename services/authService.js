const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const config = require('../config/config');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const register = async (userData) => {
    const { email, password, name, phone, role } = userData;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestError('User already exists with this email');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            phone,
            role: role || 'BUYER',
        },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        token,
    };
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        token,
    };
};

module.exports = {
    register,
    login,
};
