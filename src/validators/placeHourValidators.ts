import Joi from "joi";
import { arraySchema, numberSchema, stringSchema } from "./schemas";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const placeHourSchema = Joi.object({
    dayOfWeek: numberSchema.label('day of week').integer().required().min(0).max(6).messages({
        "number.base": "Day of week must be a number.",
        "number.min": "Day of week must be between 0 (Sunday) and 6 (Saturday).",
        "number.max": "Day of week must be between 0 (Sunday) and 6 (Saturday).",
        "any.required": "Day of week is required."
    }),
    opensAt: stringSchema.label('opens at').required().pattern(TIME_PATTERN).messages({
        "string.pattern.base": "Opens at must be a time in HH:mm or HH:mm:ss format."
    }),
    closesAt: stringSchema.label('closes at').required().pattern(TIME_PATTERN).messages({
        "string.pattern.base": "Closes at must be a time in HH:mm or HH:mm:ss format."
    })
})

const setPlaceHoursSchema = Joi.object({
    hours: arraySchema.label('hours').items(placeHourSchema).max(7).required().messages({
        "array.max": "A place can have at most 7 hours entries (one per day)."
    })
})

export {
    setPlaceHoursSchema
}
