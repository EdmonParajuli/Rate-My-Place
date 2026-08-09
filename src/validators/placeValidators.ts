import Joi from "joi";
import { numberSchema, phoneSchema, stringSchema } from "./schemas";


const createPlaceSchema = Joi.object({
    label: stringSchema.label('name').required().min(2).max(100).pattern(/^[a-zA-Z0-9\s,'.-]+$/).trim().messages({
        "string.empty": "Place name shouldnot be empty.",
        "string.min" : "Place name should be at least 2 characters",
        "string.max" : "Place name should be at most 100 characters.", 
        "string.pattern.base": "Place name should contain only alphanumeric characters."
    }),
    description: stringSchema.label('description').min(10).max(255).trim().messages({
        "string.min" : "Description should be at least 10 characters.",
        "string.max" : "Description should be at most 255 characters."
    }),
    address: stringSchema.label('address').required().min(10).max(25).pattern(/^[a-zA-Z0-9\s,'.-]+$/).trim().messages({
        "string.empty": "Place address shouldnot be empty.",
        "string.min" : "Place address should be at least 10 characters",
        "string.max" : "Place address should be at most 25 characters.", 
        "string.pattern.base": "Place address should contain only alphanumeric characters."
    }),
    phone: phoneSchema.label('phone number').required().messages({
        "string.empty": "Phone number cannot be empty.",
        "string.min": "Phone number should be at least 7 numbers.", 
        "string.max": "Phone number should be at most 16 characters.",
        "string.pattern.base": "Invalid phone number."
    }),
    website: stringSchema.optional(),
    averageRating: numberSchema.label('average rating').allow(null).min(0).max(5).optional().messages({
        "string.min": "Average Rating should be at least 0.",
        "string.max": "Average Rating should be at most 5.",
    }),
    reviewCount: numberSchema.label('review count').allow(null),
    categoryId: numberSchema.label('category id').required().messages({
        "number.base": "Category ID must be a number.",
        "any.required": "Category ID is required."
    }),
    latitude: numberSchema.label('latitude').min(-90).max(90).allow(null).optional().messages({
        "number.min": "Latitude must be between -90 and 90.",
        "number.max": "Latitude must be between -90 and 90."
    }),
    longitude: numberSchema.label('longitude').min(-180).max(180).allow(null).optional().messages({
        "number.min": "Longitude must be between -180 and 180.",
        "number.max": "Longitude must be between -180 and 180."
    })
})

export {
    createPlaceSchema
}