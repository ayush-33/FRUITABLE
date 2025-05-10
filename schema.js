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
          })
    }).required()
});
