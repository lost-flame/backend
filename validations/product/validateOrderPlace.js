import Joi from 'joi';

export const validateOrderPlace = (user) => {
    console.log('joi ', user);

    const currentYear = new Date().getFullYear();
    const expiryRegex = new RegExp(`^(0[1-9]|1[0-2])\/(${currentYear}|${currentYear + 1}|${currentYear + 2}|${currentYear + 3}|${currentYear + 4}|${currentYear + 5})$`);

    const JoiSchema = Joi.object({
        formData: Joi.object({
            name: Joi.string()
                .min(2)
                .max(50)
                .regex(/^[a-zA-Z\s]+$/)
                .trim()
                .required()
                .messages({
                    'string.base': 'Name must be a string',
                    'string.empty': 'Name cannot be empty',
                    'string.min': 'Name must be at least 2 characters',
                    'string.max': 'Name cannot exceed 50 characters',
                    'string.pattern.base': 'Name can only contain letters and spaces',
                    'any.required': 'Name is required'
                }),

            'account number': Joi.string()
                .length(16)
                .pattern(/^\d{16}$/)
                .required()
                .messages({
                    'string.base': 'Account number must be a string',
                    'string.empty': 'Account number cannot be empty',
                    'string.length': 'Account number must be exactly 16 digits',
                    'string.pattern.base': 'Account number must contain only digits',
                    'any.required': 'Account number is required'
                }),

            cvv: Joi.string()
                .length(3)
                .pattern(/^\d{3}$/)
                .required()
                .messages({
                    'string.base': 'CVV must be a string',
                    'string.empty': 'CVV cannot be empty',
                    'string.length': 'CVV must be exactly 3 digits',
                    'string.pattern.base': 'CVV must contain only digits',
                    'any.required': 'CVV is required'
                }),

            'expiry date': Joi.string()
                // .pattern(/^(0[1-9]|1[0-2])\/(20[2-9][0-9])$/)
                .pattern(expiryRegex)
                .required()
                .messages({
                    'string.base': 'Expiry date must be a string',
                    'string.empty': 'Expiry date cannot be empty',
                    'string.pattern.base': 'Expiry date must be in MM/YYYY format and a valid future year',
                    'any.required': 'Expiry date is required'
                }),
        }).required(),

        cart_id: Joi.number().min(1).max(100000),

        price: Joi.number().min(1).max(100000),

        p_id: Joi.number().min(1).max(100000),

        user_id: Joi.number().min(1).max(100000),

        quantity: Joi.number().integer().min(1).max(40),

    }).options({ abortEarly: false });// get all the errors, not only first error

    return JoiSchema.validate(user);
}

