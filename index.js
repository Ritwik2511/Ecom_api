const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

// Import Prisma
let prisma = null;
try {
    prisma = require('./prismaClient');
    logger.info('✅ Prisma client loaded successfully');
} catch (error) {
    logger.error('❌ Error loading Prisma Client:', error);
}

const app = express();


// ================= SECURITY =================
app.use(helmet());

app.use(cors({
    origin: config.corsOrigin || "*",
    credentials: true
}));


// ================= RATE LIMIT =================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

if (config.env === 'production') {
    app.use('/api/', limiter);
}


// ================= LOGGER =================
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});


// ================= BODY =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// ================= HEALTH =================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running 🚀',
        env: config.env,
        prismaConnected: prisma !== null
    });
});


// ================= ROUTES =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/products', require('./routes/products'));
app.use('/api/sellers', require('./routes/seller'));
app.use('/api/admin', require('./routes/admin'));


// ================= SWAGGER =================
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// ================= 404 =================
app.use((req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} not found`));
});


// ================= ERROR HANDLER =================
app.use(errorHandler);


// ================= SERVER START (FIXED 🔥) =================
const PORT = process.env.PORT || config.port || 4000;

// ⚠️ IMPORTANT: 0.0.0.0 for Docker
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`📘 Docs: http://localhost:${PORT}/api-docs`);
});


// ================= GRACEFUL SHUTDOWN =================
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down server...');
    if (prisma) {
        await prisma.$disconnect();
        console.log('✅ Prisma disconnected');
    }
    process.exit(0);
});