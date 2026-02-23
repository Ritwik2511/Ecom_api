const { BadRequestError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
    try {
        const validData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Replace req data with validated data
        req.body = validData.body;
        req.query = validData.query;
        req.params = validData.params;

        return next();
    } catch (error) {
        const errorMessage = error.errors
            .map((details) => `${details.path.join('.')} : ${details.message}`)
            .join(', ');
        return next(new BadRequestError(errorMessage));
    }
};

module.exports = validate;
