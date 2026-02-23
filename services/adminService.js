const prisma = require('../prismaClient');
const { NotFoundError } = require('../utils/errors');

const getAllCustomers = async () => {
    const customers = await prisma.user.findMany({
        where: { role: 'BUYER' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            orders: {
                select: {
                    total: true,
                },
            },
            _count: {
                select: { orders: true },
            },
        },
    });

    return customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        joinedAt: customer.createdAt,
        totalOrders: customer._count.orders,
        totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.total), 0),
    }));
};

const getAllOrders = async () => {
    const orders = await prisma.order.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                },
            },
            items: {
                include: {
                    product: {
                        include: {
                            seller: {
                                select: {
                                    businessName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => {
        const vendors = new Set();
        order.items.forEach((item) => {
            if (item.product?.seller?.businessName) {
                vendors.add(item.product.seller.businessName);
            }
        });
        const vendorName = vendors.size > 0 ? Array.from(vendors).join(', ') : 'Unknown Vendor';

        return {
            id: order.id,
            customerName: order.user?.name || 'Unknown',
            customerEmail: order.user?.email || 'Unknown',
            vendor: vendorName,
            date: order.createdAt,
            total: Number(order.total),
            paymentStatus: order.status === 'PAID' ? 'Paid' : 'Pending',
            status: order.status,
        };
    });
};

const getOrderDetails = async (id) => {
    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            items: {
                include: {
                    product: {
                        include: {
                            seller: {
                                select: {
                                    businessName: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!order) throw new NotFoundError('Order not found');

    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const shipping = Number(order.shippingCost) || 0;
    const tax = Number(order.tax) || 0;
    const total = Number(order.total);

    return {
        id: order.id,
        items: order.items.map((item) => ({
            name: item.product.name,
            vendor: item.product.seller?.businessName || 'Unknown',
            sku: item.productId.substring(0, 8).toUpperCase(),
            quantity: item.quantity,
            price: Number(item.price),
            image: item.product.image,
        })),
        paymentInfo: {
            method: 'Card',
            status: order.status,
            transactionId: `TXN${Date.now().toString().slice(-8)}`,
        },
        pricing: {
            subtotal,
            tax,
            shipping,
            total,
        },
        customer: {
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
        },
        shippingAddress: {
            name: order.shippingName,
            phone: order.shippingPhone,
            addressLine1: order.shippingAddressLine1,
            addressLine2: order.shippingAddressLine2,
            city: order.shippingCity,
            state: order.shippingState,
            zip: order.shippingPostalCode,
            country: order.shippingCountry,
        },
    };
};

module.exports = {
    getAllCustomers,
    getAllOrders,
    getOrderDetails,
};
