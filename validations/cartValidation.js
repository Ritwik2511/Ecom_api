const { z } = require('zod');

const addItemSchema = z.object({
    body: z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
    }),
});

const removeItemSchema = z.object({
    params: z.object({
        itemId: z.string().min(1, 'Item ID is required'),
    }),
});

module.exports = {
    addItemSchema,
    removeItemSchema,
};
