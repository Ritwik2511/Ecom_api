const logger = require('../utils/logger');
const { ApiError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        statusCode = 500;
        message = 'Internal Server Error';
    }

    res.locals.errorMessage = err.message;

    const response = {
        success: false,
        code: statusCode || 500,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    if (process.env.NODE_ENV === 'development') {
        logger.error(err);
    } else {
        logger.error(`${statusCode || 500} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }

    res.status(statusCode || 500).send(response);
};

module.exports = errorHandler;
