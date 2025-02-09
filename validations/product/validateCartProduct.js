import Joi from 'joi';

export const validateCardProduct = (user) => {
    const JoiSchema = Joi.object({

        productName: Joi.string()
            .min(5)
            .max(30)
            .required(),

        stock: Joi.number()
            .min(1)
            .max(100)
            .required(),

        price: Joi.number().min(1).max(100000),

        p_id: Joi.number().min(1).max(100000),

        // user_id: Joi.number().min(1).max(100000),

        quantity: Joi.number().integer().min(1).max(40),

    }).options({ abortEarly: false });// get all the errors, not only first error

    return JoiSchema.validate(user);
}

