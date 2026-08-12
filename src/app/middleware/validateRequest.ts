import { NextFunction, Request, Response } from "express";
import z from "zod";
import { catchAsync } from "../utils/catchAsync";

export const validateRequest = (zodSchema: z.ZodObject) => {
    return catchAsync(
        (req: Request, res: Response, next: NextFunction) => {


            // const payload = req.body ? req.body : {}
            const payload = req.body ?? {}
            console.log(payload);

            const result = zodSchema.safeParse(payload);
            console.log(result);

            if (!result.success) {
                console.log(result.error);
                console.log(result.error.issues);

                throw new Error(result.error.issues[0].message)
            }

            req.body = result.data

            next()

        }
    )
}