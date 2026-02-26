const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-commerce API',
            version: '1.0.0',
            description: 'API documentation for the E-commerce application',
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx1234567890abcdef'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john.doe@example.com'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        phone: {
                            type: 'string',
                            example: '+91 9876543210'
                        },
                        role: {
                            type: 'string',
                            enum: ['BUYER', 'SELLER', 'ADMIN'],
                            example: 'BUYER'
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx2222222222222222'
                        },
                        name: {
                            type: 'string',
                            example: 'Wireless Headphones'
                        },
                        description: {
                            type: 'string',
                            example: 'High-quality wireless headphones'
                        },
                        price: {
                            type: 'number',
                            example: 2999.99
                        },
                        stock: {
                            type: 'integer',
                            example: 50
                        },
                        image: {
                            type: 'string',
                            example: '/uploads/product-image.jpg'
                        }
                    }
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx1111111111111111'
                        },
                        productId: {
                            type: 'string',
                            example: 'clx2222222222222222'
                        },
                        quantity: {
                            type: 'integer',
                            example: 2
                        },
                        product: {
                            $ref: '#/components/schemas/Product'
                        }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx1234567890abcdef'
                        },
                        userId: {
                            type: 'string',
                            example: 'clx0987654321fedcba'
                        },
                        items: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/CartItem'
                            }
                        }
                    }
                },
                OrderItem: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        productId: {
                            type: 'string'
                        },
                        quantity: {
                            type: 'integer'
                        },
                        price: {
                            type: 'number'
                        },
                        product: {
                            $ref: '#/components/schemas/Product'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx3333333333333333'
                        },
                        userId: {
                            type: 'string',
                            example: 'clx0987654321fedcba'
                        },
                        total: {
                            type: 'number',
                            example: 5999.98
                        },
                        status: {
                            type: 'string',
                            enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
                            example: 'PENDING'
                        },
                        shippingName: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        shippingPhone: {
                            type: 'string',
                            example: '+91 9876543210'
                        },
                        shippingAddressLine1: {
                            type: 'string',
                            example: '123 Main Street, Apartment 4B'
                        },
                        shippingAddressLine2: {
                            type: 'string',
                            nullable: true,
                            example: 'Near City Mall'
                        },
                        shippingCity: {
                            type: 'string',
                            example: 'Mumbai'
                        },
                        shippingState: {
                            type: 'string',
                            example: 'Maharashtra'
                        },
                        shippingPostalCode: {
                            type: 'string',
                            example: '400001'
                        },
                        shippingCountry: {
                            type: 'string',
                            example: 'India'
                        },
                        items: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/OrderItem'
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                Seller: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clxSeller12345'
                        },
                        userId: {
                            type: 'string',
                            example: 'clxUser12345'
                        },
                        businessName: {
                            type: 'string',
                            example: 'Tech Solutions'
                        },
                        businessType: {
                            type: 'string',
                            example: 'Electronics'
                        },
                        gstNumber: {
                            type: 'string',
                            example: 'GSTIN12345'
                        },
                        address: {
                            type: 'string',
                            example: '123 Tech Park, Silicon Valley'
                        },
                        domainUrl: {
                            type: 'string',
                            example: 'https://techsolutions.com'
                        },
                        publicKey: {
                            type: 'string',
                            example: 'public-key-abcdef'
                        },
                        privateKey: {
                            type: 'string',
                            example: 'private-key-secret'
                        },
                        urlEndpoint: {
                            type: 'string',
                            example: 'https://api.techsolutions.com/webhook'
                        },
                        panCard: {
                            type: 'string',
                            example: 'ABCDE1234F'
                        },
                        aadharCard: {
                            type: 'string',
                            example: '123456789012'
                        },
                        bankName: {
                            type: 'string',
                            example: 'State Bank of India'
                        },
                        accountNumber: {
                            type: 'string',
                            example: '1234567890'
                        },
                        accountHolderName: {
                            type: 'string',
                            example: 'Tech Solutions'
                        },
                        ifscCode: {
                            type: 'string',
                            example: 'SBIN0001234'
                        },
                        isSuspended: {
                            type: 'boolean',
                            example: false
                        },
                        usePlatformPG: {
                            type: 'boolean',
                            example: true
                        },
                        pgClientId: {
                            type: 'string',
                            example: 'C153C1784DD2229984C56996B2B9EAE62377BE55E653'
                        },
                        pgSecretKey: {
                            type: 'string',
                            example: 'secret-key-xyz'
                        },
                        pgEncryptionKey: {
                            type: 'string',
                            example: 'encryption-key-123'
                        },
                        pgWebhookUrl: {
                            type: 'string',
                            example: 'https://webhook.site/...'
                        },
                        logo: {
                            type: 'string',
                            example: 'https://ik.imagekit.io/yourstore/logo.png'
                        },
                        favicon: {
                            type: 'string',
                            example: 'https://ik.imagekit.io/yourstore/favicon.ico'
                        },
                        primaryColor: {
                            type: 'string',
                            example: '#000000'
                        },
                        secondaryColor: {
                            type: 'string',
                            example: '#ffffff'
                        },
                        aboutUs: {
                            type: 'string',
                            example: 'We are a leading tech retailer...'
                        },
                        supportEmail: {
                            type: 'string',
                            format: 'email',
                            example: 'support@techsolutions.com'
                        },
                        supportPhone: {
                            type: 'string',
                            example: '+91 9999988888'
                        },
                        facebookUrl: {
                            type: 'string',
                            example: 'https://facebook.com/techsolutions'
                        },
                        instagramUrl: {
                            type: 'string',
                            example: 'https://instagram.com/techsolutions'
                        },
                        twitterUrl: {
                            type: 'string',
                            example: 'https://twitter.com/techsolutions'
                        },
                        linkedinUrl: {
                            type: 'string',
                            example: 'https://linkedin.com/company/techsolutions'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clxCategory123'
                        },
                        name: {
                            type: 'string',
                            example: 'Electronics'
                        },
                        description: {
                            type: 'string',
                            example: 'Electronic gadgets and accessories'
                        },
                        _count: {
                            type: 'object',
                            properties: {
                                products: {
                                    type: 'integer',
                                    example: 15
                                }
                            }
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
