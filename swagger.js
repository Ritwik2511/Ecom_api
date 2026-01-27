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
