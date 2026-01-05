const Joi = require('joi');
const review = require('./models/review');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        category: Joi.array()
            .items(
                Joi.string().valid(
                    "Rooms",
                    "Iconic cities",
                    "Mountains",
                    "Castles",
                    "Amazing pools",
                    "Camping",
                    "Farms",
                    "Arctic",
                    "Domes",
                    "Boats"
                )
            )
            .min(1)
            .max(3)
            .required(),
        image: Joi.string().allow("", null)
    }).required()
});

module.exports.reviewSchema = Joi.object ({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required(),
});

