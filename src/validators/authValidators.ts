import Joi from "joi";
import { emailSchema, numberSchema, phoneSchema, stringSchema } from "./schemas";
import { UserTypeEnum } from "../enums/userTypesEnum";
import { PriceRangeEnum } from "../enums/priceRangeEnum";

const signUpSchema = Joi.object({
    name: stringSchema.label('Name').required().min(2).max(25).pattern(/^[a-zA-Z][\w\s]*[a-zA-Z]$/).trim().messages({
        "string.empty": "Name shouldnot be Empty.",
        "string.min": "Name should be at least 2 characters",
        "string.max": "Name should be at most 25 characters.",
        "string.pattern.base": "Name should contain only letters."
    }),
    email: emailSchema.label('Email').required().trim(),
    password: stringSchema.label('Password').required().max(64).messages({
    "string.empty": "Password should not be Empty.",
    "string.min": "Password should be at least 8 characters.",
    "string.max": "Password should be at most 64 characters."
  }),
  userType: stringSchema.valid(...Object.values(UserTypeEnum)).required()
});

const loginSchema = Joi.object({
    email: emailSchema.label("Email").required().trim(),
    password: stringSchema.label("password").required()
})

const passwordSchema = stringSchema.min(8).max(64).messages({
    "string.empty": "Password should not be empty.",
    "string.min": "Password should be at least 8 characters.",
    "string.max": "Password should be at most 64 characters."
});

const changePasswordSchema = Joi.object({
    previousPassword: passwordSchema.label("Previous password").required(),
    newPassword: passwordSchema.label("New password").required(),
    confirmNewPassword: passwordSchema.label("Confirm new password").required().valid(Joi.ref("newPassword")).messages({
        "any.only": "Confirm new password must match new password."
    }),
    refreshToken: stringSchema.label("Refresh token").optional()
})

const forgotPasswordSchema = Joi.object({
    email: emailSchema.label("Email").required().trim()
})

const confirmForgotPasswordSchema = Joi.object({
    email: emailSchema.label("Email").required().trim(),
    verificationCode: stringSchema.label("Verification code").required(),
    newPassword: passwordSchema.label("New password").required()
})

const signOutSchema = Joi.object({
    refreshToken: stringSchema.label("Refresh token").required()
})

// A dedicated schema, per CLAUDE.md's "every mutation input gets one, even a
// thin one" - not a thin wrapper composing signUpSchema/createPlaceSchema,
// same field-level rules as both (name/email/password from signUpSchema,
// place fields from createPlaceSchema) since this is a flat input, not a
// nested one.
const signUpBusinessSchema = Joi.object({
    name: stringSchema.label('Name').required().min(2).max(25).pattern(/^[a-zA-Z][\w\s]*[a-zA-Z]$/).trim().messages({
        "string.empty": "Name shouldnot be Empty.",
        "string.min": "Name should be at least 2 characters",
        "string.max": "Name should be at most 25 characters.",
        "string.pattern.base": "Name should contain only letters."
    }),
    email: emailSchema.label('Email').required().trim(),
    password: stringSchema.label('Password').required().max(64).messages({
        "string.empty": "Password should not be Empty.",
        "string.min": "Password should be at least 8 characters.",
        "string.max": "Password should be at most 64 characters."
    }),
    label: stringSchema.label('Place name').required().min(2).max(100).pattern(/^[a-zA-Z0-9\s,'.-]+$/).trim().messages({
        "string.empty": "Place name shouldnot be empty.",
        "string.min": "Place name should be at least 2 characters",
        "string.max": "Place name should be at most 100 characters.",
        "string.pattern.base": "Place name should contain only alphanumeric characters."
    }),
    description: stringSchema.label('Description').min(10).max(255).trim().optional().messages({
        "string.min": "Description should be at least 10 characters.",
        "string.max": "Description should be at most 255 characters."
    }),
    address: stringSchema.label('Address').required().min(10).max(25).pattern(/^[a-zA-Z0-9\s,'.-]+$/).trim().messages({
        "string.empty": "Place address shouldnot be empty.",
        "string.min": "Place address should be at least 10 characters",
        "string.max": "Place address should be at most 25 characters.",
        "string.pattern.base": "Place address should contain only alphanumeric characters."
    }),
    phone: phoneSchema.label('Phone number').required().messages({
        "string.empty": "Phone number cannot be empty.",
        "string.min": "Phone number should be at least 7 numbers.",
        "string.max": "Phone number should be at most 16 characters.",
        "string.pattern.base": "Invalid phone number."
    }),
    website: stringSchema.optional(),
    categoryId: numberSchema.label('Category id').required().messages({
        "number.base": "Category ID must be a number.",
        "any.required": "Category ID is required."
    }),
    priceRange: stringSchema.label('Price range').valid(...Object.values(PriceRangeEnum)).allow(null).optional().messages({
        "any.only": "Price range must be one of LOW, MEDIUM, HIGH."
    })
});

export {
    signUpSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    confirmForgotPasswordSchema,
    signOutSchema,
    signUpBusinessSchema
};