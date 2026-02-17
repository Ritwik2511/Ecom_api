const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const authMiddleware = require('../middleware/auth');
const upload = require('../utils/upload');
const { uploadToImageKit } = require('../utils/imagekitService');

/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: Seller management
 */

/**
 * @swagger
 * /sellers/enroll:
 *   post:
 *     summary: Enroll a new seller
 *     description: Admin can enroll a new seller. Creates a User account (if not exists) and a Seller profile. Login credentials are sent to the seller's email.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessType
 *               - email
 *               - phone
 *               - ownerName
 *               - gstNumber
 *               - address
 *               - domainUrl
 *               - publicKey
 *               - privateKey
 *               - urlEndpoint
 *             properties:
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               domainUrl:
 *                 type: string
 *               publicKey:
 *                 type: string
 *               privateKey:
 *                 type: string
 *               urlEndpoint:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Optional password for the user. If not provided, a random one will be generated.
 *     responses:
 *       201:
 *         description: Seller enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing required fields or seller already exists
 *       401:
 *         description: Unauthorized (Admin only)
 *       500:
 *         description: Internal server error
 */
router.post('/enroll', authMiddleware, async (req, res) => {
    try {
        // Check if requester is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const {
            businessName,
            businessType,
            email,
            phone,
            ownerName,
            gstNumber,
            address,
            domainUrl,
            publicKey,
            privateKey,
            urlEndpoint,
            password,
            panCard,
            aadharCard,
            bankDetails
        } = req.body;

        // Validation
        if (!businessName || !businessType || !email || !phone || !ownerName || !gstNumber || !address || !domainUrl || !publicKey || !privateKey || !urlEndpoint) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });

        const tempPassword = password || Math.random().toString(36).slice(-8) + "Aa1@";
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    phone,
                    name: ownerName,
                    password: hashedPassword,
                    role: 'VENDOR' // Assuming VENDOR is the role for Seller
                }
            });
        } else {
            // Update existing user role if needed
            if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'VENDOR' }
                });
            }
            // Check if seller profile already exists
            const existingSeller = await prisma.seller.findUnique({
                where: { userId: user.id }
            });

            if (existingSeller) {
                return res.status(400).json({ error: 'Seller profile already exists for this user' });
            }
        }

        // Create Seller profile
        const seller = await prisma.seller.create({
            data: {
                userId: user.id,
                businessName,
                businessType,
                gstNumber,
                address,
                domainUrl,
                publicKey,
                privateKey,
                urlEndpoint,
                panCard,
                aadharCard,
                bankName: bankDetails?.bankName,
                accountNumber: bankDetails?.accountNumber,
                accountHolderName: bankDetails?.accountHolderName,
                ifscCode: bankDetails?.ifscCode
            }
        });

        // Send email with credentials
        const sendEmail = require('../utils/emailService');
        try {
            if (!password) {
                await sendEmail(
                    email,
                    'Welcome to E-commerce Platform - Seller Account',
                    `Hello ${ownerName},\n\nYour seller account has been created successfully.\n\nHere are your login credentials:\nEmail: ${email}\nPassword: ${tempPassword}\n\nPlease login and change your password immediately.\n\nBest Regards,\nAdmin Team`,
                    `<p>Hello ${ownerName},</p><p>Your seller account has been created successfully.</p><p>Here are your login credentials:</p><p><strong>Email:</strong> ${email}<br><strong>Password:</strong> ${tempPassword}</p><p>Please login and change your password immediately.</p><p>Best Regards,<br>Admin Team</p>`
                );
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // We still want to return success for the account creation, but maybe warn about email
        }

        res.status(201).json({
            message: 'Seller enrolled successfully. Credentials sent to email.',
            seller,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Enroll seller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @swagger
 * /sellers/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a list of all product categories. Accessible by Sellers.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Sellers and Admins only.' });
        }
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers:
 *   get:
 *     summary: Get all sellers
 *     description: Retrieve a list of all enrolled sellers. Admin only.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied (Admin only)
 *       500:
 *         description: Internal server error
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const sellers = await prisma.seller.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        role: true
                    }
                }
            }
        });

        res.json(sellers);
    } catch (error) {
        console.error('Get sellers error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/products:
 *   post:
 *     summary: Add a new product
 *     description: Sellers can add a new product with an image upload.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file to upload
 *               images:
 *                 type: string
 *                 format: binary
 *                 description: Product image file to upload (alternative field name)
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing fields or invalid category
 *       403:
 *         description: Access denied (Seller only)
 *       404:
 *         description: Seller profile not found
 *       500:
 *         description: Internal server error
 */
router.post('/products', authMiddleware, upload.any(), async (req, res) => {
    try {
        console.log('=== PRODUCT CREATE REQUEST (BACKEND) ===');
        console.log('User:', req.user);
        console.log('Body:', req.body);
        console.log('Files:', req.files);

        if (req.user.role !== 'VENDOR') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        // With multer, body might be parsed as strings
        const { name, description, categoryId } = req.body;
        const price = parseFloat(req.body.price);
        const stock = parseInt(req.body.stock);

        // Handle both 'image' and 'images' field names
        let imageFile = null;
        if (req.files && req.files.length > 0) {
            // Find the image file (could be named 'image' or 'images')
            imageFile = req.files.find(f => f.fieldname === 'image' || f.fieldname === 'images');
        }

        let image = null;
        if (imageFile) {
            try {
                console.log('Uploading image to ImageKit:', imageFile.originalname);
                image = await uploadToImageKit(imageFile, {
                    publicKey: seller.publicKey,
                    privateKey: seller.privateKey,
                    urlEndpoint: seller.urlEndpoint
                });
                console.log('Image uploaded successfully:', image);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.status(500).json({ error: 'Image upload failed', details: uploadError.message });
            }
        }

        if (!name || isNaN(price) || isNaN(stock) || !categoryId) {
            return res.status(400).json({ error: 'Name, price, stock, and categoryId are required' });
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            return res.status(400).json({ error: 'Invalid categoryId. Category does not exist.' });
        }

        console.log('Creating product with data:', { name, description, price, stock, image, categoryId, sellerId: seller.id });

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                image,
                categoryId,
                sellerId: seller.id,
                sellerStoreName: seller.businessName
            }
        });

        console.log('Product created successfully:', product);
        res.status(201).json(product);
    } catch (error) {
        console.error('Add product error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * @swagger
 * /sellers/products:
 *   get:
 *     summary: Get products of the logged-in seller
 *     description: Retrieve a list of products added by the current seller.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *       403:
 *         description: Access denied
 *       404:
 *         description: Seller profile not found
 */
router.get('/products', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const products = await prisma.product.findMany({
            where: { sellerId: seller.id },
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/my-products:
 *   get:
 *     summary: Get products of the logged-in seller (alias)
 *     description: Retrieve a list of products added by the current seller. This is an alias for /sellers/products.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *       403:
 *         description: Access denied
 *       404:
 *         description: Seller profile not found
 */
router.get('/my-products', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const products = await prisma.product.findMany({
            where: { sellerId: seller.id },
            include: {
                category: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(products);
    } catch (error) {
        console.error('Get my products error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/orders:
 *   get:
 *     summary: Get orders containing seller's products
 *     description: Retrieve a list of orders that include products owned by the logged-in seller.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders with items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   orderStatus:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   customer:
 *                     type: object
 *                   shippingDetails:
 *                     type: object
 *                   items:
 *                     type: array
 *                   sellerSubtotal:
 *                     type: number
 *       403:
 *         description: Access denied (Seller only)
 *       404:
 *         description: Seller profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            sellerId: seller.id
                        }
                    }
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                items: {
                    where: {
                        product: {
                            sellerId: seller.id
                        }
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                image: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format orders for the response
        const formattedOrders = orders.map(order => {
            const sellerItems = order.items;
            const sellerTotal = sellerItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

            return {
                id: order.id,
                orderStatus: order.status,
                createdAt: order.createdAt,
                customer: order.user,
                shippingDetails: {
                    name: order.shippingName,
                    phone: order.shippingPhone,
                    address: `${order.shippingAddressLine1}${order.shippingAddressLine2 ? ', ' + order.shippingAddressLine2 : ''}`,
                    city: order.shippingCity,
                    state: order.shippingState,
                    postalCode: order.shippingPostalCode,
                    country: order.shippingCountry
                },
                items: sellerItems,
                sellerSubtotal: sellerTotal
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * @swagger
 * /sellers/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     description: Sellers can update the status of an order that contains their products.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order or Seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/orders/:orderId/status', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const { orderId } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Check if the order contains at least one product from this seller
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                items: {
                    some: {
                        product: {
                            sellerId: seller.id
                        }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found or does not contain your products' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });

        res.json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

/**
 * @swagger
 * /sellers/{id}:
 *   get:
 *     summary: Get seller details
 *     description: Retrieve detailed information about a specific seller by their ID. Admin only.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;

        const seller = await prisma.seller.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        role: true
                    }
                }
            }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        // Mock performance metrics for now 
        // In a real app, you would count actual products and orders
        // const productsCount = await prisma.product.count({ where: { sellerId: seller.id } }); // Assuming product has sellerId
        const metrics = {
            products: 45,
            orders: 234,
            rating: "N/A"
        };

        res.json({ ...seller, metrics });
    } catch (error) {
        console.error('Get seller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/{id}:
 *   put:
 *     summary: Update seller profile
 *     description: Admin can update seller's business details, bank details, and user account information.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               domainUrl:
 *                 type: string
 *               publicKey:
 *                 type: string
 *               privateKey:
 *                 type: string
 *               urlEndpoint:
 *                 type: string
 *               panCard:
 *                 type: string
 *               aadharCard:
 *                 type: string
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   bankName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   accountHolderName:
 *                     type: string
 *                   ifscCode:
 *                     type: string
 *               user:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const {
            businessName,
            businessType,
            gstNumber,
            address,
            domainUrl,
            publicKey,
            privateKey,
            urlEndpoint,
            panCard,
            aadharCard,
            bankDetails,
            user: userData
        } = req.body;

        const seller = await prisma.seller.findUnique({
            where: { id }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const updatedSeller = await prisma.seller.update({
            where: { id },
            data: {
                businessName: businessName !== undefined ? businessName : undefined,
                businessType: businessType !== undefined ? businessType : undefined,
                gstNumber: gstNumber !== undefined ? gstNumber : undefined,
                address: address !== undefined ? address : undefined,
                domainUrl: domainUrl !== undefined ? domainUrl : undefined,
                publicKey: publicKey !== undefined ? publicKey : undefined,
                privateKey: privateKey !== undefined ? privateKey : undefined,
                urlEndpoint: urlEndpoint !== undefined ? urlEndpoint : undefined,
                panCard: panCard !== undefined ? panCard : undefined,
                aadharCard: aadharCard !== undefined ? aadharCard : undefined,
                bankName: bankDetails?.bankName !== undefined ? bankDetails.bankName : undefined,
                accountNumber: bankDetails?.accountNumber !== undefined ? bankDetails.accountNumber : undefined,
                accountHolderName: bankDetails?.accountHolderName !== undefined ? bankDetails.accountHolderName : undefined,
                ifscCode: bankDetails?.ifscCode !== undefined ? bankDetails.ifscCode : undefined,
                user: userData ? {
                    update: {
                        name: userData.name !== undefined ? userData.name : undefined,
                        phone: userData.phone !== undefined ? userData.phone : undefined,
                        email: userData.email !== undefined ? userData.email : undefined,
                    }
                } : undefined
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        role: true
                    }
                }
            }
        });

        res.json({
            message: 'Seller profile updated successfully',
            seller: updatedSeller
        });
    } catch (error) {
        console.error('Update seller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/{id}/suspend:
 *   put:
 *     summary: Suspend a seller
 *     description: Suspend a seller account. Admin only.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller suspended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/suspend', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;

        const seller = await prisma.seller.findUnique({ where: { id } });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const updatedSeller = await prisma.seller.update({
            where: { id },
            data: { isSuspended: true }
        });

        res.json({
            message: 'Seller suspended successfully',
            seller: updatedSeller
        });
    } catch (error) {
        console.error('Suspend seller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/{id}/activate:
 *   put:
 *     summary: Activate a seller
 *     description: Activate a suspended seller account. Admin only.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied (Admin only)
 *       404:
 *         description: Seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/activate', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        const { id } = req.params;

        const seller = await prisma.seller.findUnique({ where: { id } });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const updatedSeller = await prisma.seller.update({
            where: { id },
            data: { isSuspended: false }
        });

        res.json({
            message: 'Seller activated successfully',
            seller: updatedSeller
        });
    } catch (error) {
        console.error('Activate seller error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Sellers can update their own product, including uploading a new image.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New product image file
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input or category
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product or Seller not found
 *       500:
 *         description: Internal server error
 */
router.put('/products/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const { id } = req.params;
        const { name, description, categoryId } = req.body;
        const price = req.body.price !== undefined ? parseFloat(req.body.price) : undefined;
        const stock = req.body.stock !== undefined ? parseInt(req.body.stock) : undefined;
        let image = undefined;
        if (req.file) {
            try {
                image = await uploadToImageKit(req.file, {
                    publicKey: seller.publicKey,
                    privateKey: seller.privateKey,
                    urlEndpoint: seller.urlEndpoint
                });
            } catch (uploadError) {
                return res.status(500).json({ error: 'Image upload failed', details: uploadError.message });
            }
        }

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerId !== seller.id) {
            return res.status(403).json({ error: 'Access denied. You can only update your own products.' });
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!category) return res.status(400).json({ error: 'Invalid categoryId' });
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: name !== undefined ? name : product.name,
                description: description !== undefined ? description : product.description,
                price: price !== undefined ? price : product.price,
                stock: stock !== undefined ? stock : product.stock,
                image: image !== undefined ? image : product.image,
                categoryId: categoryId !== undefined ? categoryId : product.categoryId
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /sellers/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Sellers can delete their own product.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Product or Seller not found
 *       500:
 *         description: Internal server error
 */
router.delete('/products/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'VENDOR') {
            return res.status(403).json({ error: 'Access denied. Seller account required.' });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: req.user.userId }
        });

        if (!seller) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerId !== seller.id) {
            return res.status(403).json({ error: 'Access denied. You can only delete your own products.' });
        }

        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

