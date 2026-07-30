import Joi from "joi";
import { stringSchema } from "./schemas";

// A reply has one field, required on both create and update - unlike review's
// create/update schemas (which genuinely diverge: update makes fields
// optional), so there's no divergence here to justify two definitions.
const reviewReplySchema = Joi.object({
    description: stringSchema.label('description').required().min(1).max(1000).trim().messages({
        "string.empty": "Reply shouldnot be empty.",
        "string.max": "Reply should be at most 1000 characters."
    })
})

export {
    reviewReplySchema as createReviewReplySchema,
    reviewReplySchema as updateReviewReplySchema
}
