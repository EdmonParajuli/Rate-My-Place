import Joi from "joi";
import { emailSchema, stringSchema } from "./schemas";
import { UserTypeEnum } from "../enums/userTypesEnum";

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


export {
    signUpSchema,
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    confirmForgotPasswordSchema,
    signOutSchema
};