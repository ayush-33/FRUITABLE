const Joi = require('joi');
const mongoose = require("mongoose");

module.exports.productSchema = Joi.object({
    product : Joi.object({
        name : Joi.string().required(),
        category : Joi.string().required(),
        description : Joi.string().required(),
        price : Joi.number().required().min(0),
        image: Joi.object({
            url: Joi.string().uri(),
            filename: Joi.string()
          }),
          isFresh: Joi.boolean()
    })
    .required()
});

module.exports.reviewSchema = Joi.object({
    review :Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
})
