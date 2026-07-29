import joi from "joi";
import joiDate from '@joi/date';

const Joi = joi as typeof joi;
const JoiDate = Joi.extend(joiDate);

const stringSchema = Joi.string();

const objectSchema = Joi.object();

const numberSchema = Joi.number();

const booleanSchema = Joi.boolean();

const positiveIntegerSchema = Joi.number().integer().min(1);

const emailSchema = Joi.string().email({minDomainSegments: 2}).lowercase().trim();

const phoneSchema = Joi.string().min(7).max(16).pattern(/^[+]{1}(?:[0-9\-\(\)\/\.]\s?){6, 15}[0-9]{1}$/).trim();

const urlSchema = Joi.string().uri();

const dateSchema = JoiDate.date().format(['YYYY/MM/DD', 'YYYY-MM-DD']);

const timeSchema = JoiDate.date().format(['HH:mm:ss']);

const dateAndTimeSchema = JoiDate.date();

const arraySchema = Joi.array();

const forbiddenSchema = Joi.forbidden();

export {
    stringSchema,
    objectSchema,
    numberSchema,
    booleanSchema,
    positiveIntegerSchema,
    emailSchema,
    phoneSchema,
    urlSchema,
    dateSchema,
    timeSchema,
    dateAndTimeSchema,
    arraySchema,
    forbiddenSchema
}
