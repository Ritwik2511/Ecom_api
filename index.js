require('dotenv').config();
const express = require('express');

// Import shared Prisma client
let prisma = null;
try {
    prisma = require('./prismaClient');
    console.log('✅ Prisma client loaded successfully');
} catch (error) {
    console.error('Error loading Prisma Client:', error);
    console.warn('⚠️  Prisma client failed to load.');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running', prismaConnected: prisma !== null });
});

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers', require('./routes/seller'));
app.use('/api/admin', require('./routes/admin'));
app.get('/api', (req, res) => {
    res.json({ message: 'API is working' });
});

// Swagger Documentation
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`Swagger Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`Prisma Studio: http://localhost:5556`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    if (prisma) {
        await prisma.$disconnect();
    }
    process.exit(0);
});
