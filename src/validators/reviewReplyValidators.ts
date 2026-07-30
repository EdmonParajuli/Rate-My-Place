import Joi from "joi";
import { stringSchema } from "./schemas";

const createReviewReplySchema = Joi.object({
    description: stringSchema.label('description').required().min(1).max(1000).trim().messages({
        "string.empty": "Reply shouldnot be empty.",
        "string.max": "Reply should be at most 1000 characters."
    })
})

const updateReviewReplySchema = Joi.object({
    description: stringSchema.label('description').required().min(1).max(1000).trim().messages({
        "string.empty": "Reply shouldnot be empty.",
        "string.max": "Reply should be at most 1000 characters."
    })
})

export {
    createReviewReplySchema,
    updateReviewReplySchema
}
