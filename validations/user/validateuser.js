import Joi from 'joi';

export const validateUser = (user) => {
    const JoiSchema = Joi.object({

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

        email: Joi.string()
            .email({ tlds: { allow: ['com', 'net', 'org'] } })
            .pattern(/@(gmail|yahoo)\.com$/)
            .min(5)
            .max(50)
            .required(),

        about: Joi.string()
            .min(5)
            .max(200)
            .required(),

        age: Joi.number().integer().min(1).max(40),

        contact: Joi.number()
            .integer()
            .min(1000000000)  // Minimum 10-digit number
            .max(9999999999)  // Maximum 10-digit number
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-={}\\[\\]|;:\'",.<>?/]).{8,}$'))
            .message('Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.')
            .max(50)
            .required()

    }).options({ abortEarly: false });// get all the errors, not only first error

    return JoiSchema.validate(user);
}

