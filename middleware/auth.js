const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Authentication required'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid or expired token'));
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action'));
        }
        next();
    };
};

module.exports = {
    auth,
    authorize,
};
