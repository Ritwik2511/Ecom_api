const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

// Import shared Prisma client
let prisma = null;
try {
    prisma = require('./prismaClient');
    logger.info('✅ Prisma client loaded successfully');
} catch (error) {
    logger.error('Error loading Prisma Client:', error);
}

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply rate limiting to all requests in production
if (config.env === 'production') {
    app.use('/api/', limiter);
}

// Request logging middleware
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        env: config.env,
        prismaConnected: prisma !== null
    });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sellers', require('./routes/seller'));
app.use('/api/admin', require('./routes/admin'));

// Swagger Documentation
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler
app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    logger.info(`🚀 Server is running on http://localhost:${config.port}`);
    logger.info(`📊 Health check: http://localhost:${config.port}/health`);
    logger.info(`Swagger Documentation: http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    if (prisma) {
        await prisma.$disconnect();
        logger.info('Prisma disconnected');
    }
    process.exit(0);
});

