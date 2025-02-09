import Joi from 'joi';

export const validateProduct = (user) => {
    const JoiSchema = Joi.object({

        name: Joi.string()
            .min(2)
            .max(50)
            .trim()
            .required(),

        stock: Joi.number()
            .min(1)
            .max(100)
            .required(),


        brand: Joi.string()
            .min(5)
            .max(30)
            .required(),

        description: Joi.string()
            .min(5)
            .max(200)
            .required(),

        price: Joi.number().min(1).max(100000),

        ratings: Joi.number().min(1).max(100000),

        categoryId: Joi.number().integer().min(1).max(40),

        categoryName: Joi.string()
            .min(5)
            .max(30)
            .required(),

        productimg: Joi.string()
            .min(5)
            .max(10000)
            .required(),

    }).options({ abortEarly: false });// get all the errors, not only first error

    return JoiSchema.validate(user);
}

