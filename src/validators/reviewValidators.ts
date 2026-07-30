import Joi from "joi";
import { numberSchema, stringSchema } from "./schemas";

const createReviewSchema = Joi.object({
    review: stringSchema.label('review').required().min(10).max(1000).trim().messages({
        "string.empty": "Review shouldnot be empty.",
        "string.min": "Review should be at least 10 characters.",
        "string.max": "Review should be at most 1000 characters."
    }),
    rating: numberSchema.label('rating').integer().required().min(1).max(5).messages({
        "number.base": "Rating must be a number.",
        "number.min": "Rating should be at least 1.",
        "number.max": "Rating should be at most 5.",
        "any.required": "Rating is required."
    })
})

const updateReviewSchema = Joi.object({
    review: stringSchema.label('review').min(10).max(1000).trim().messages({
        "string.empty": "Review shouldnot be empty.",
        "string.min": "Review should be at least 10 characters.",
        "string.max": "Review should be at most 1000 characters."
    }),
    rating: numberSchema.label('rating').integer().min(1).max(5).messages({
        "number.base": "Rating must be a number.",
        "number.min": "Rating should be at least 1.",
        "number.max": "Rating should be at most 5."
    })
}).or('review', 'rating').messages({
    "object.missing": "Provide at least a review or a rating to update."
})

export {
    createReviewSchema,
    updateReviewSchema
}
