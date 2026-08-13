import { NextFunction } from "express-serve-static-core";
import { ArraySchema, ObjectSchema, StringSchema } from "joi";

class Validator {

    private static instance: Validator;

    private constructor() {};

    static get(): Validator {
        if(!Validator.instance){
            Validator.instance = new Validator();
        }
        return Validator.instance;
    }

    public check = (schema: ObjectSchema | ArraySchema | StringSchema, input: object | string) => {
        const {error} = schema.validate(input, {
            abortEarly: false,
        });

        if(error){
            throw error;
        }
    };

    checkNext = (schema: ObjectSchema | ArraySchema) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const { error } = schema.validate(req.body, {
              abortEarly: false,
            });
            if (error) throw error;
            next();
        };
    }
}

const validator = Validator.get();
export {validator as Validator}