import { AppError } from "./index";
import { NextFunction, Request, Response } from "express"; //In JS, you’d just write: (req, res) => {}, Request and Response are types

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        console.log(`Error ${req.method} ${req.url} - ${err.message}`);

        return res.status(err.statusCode).json({
            status: "error",
            message: err.message,
            ...(err.details && { details: err.details }),
        });
    }

    // Log full details for connection/aggregate errors so DB/network issues are visible
    const isAggregate = err instanceof AggregateError;
    if (isAggregate) {
        console.error("Unhandled Error (AggregateError):", err.message);
        (err as AggregateError).errors?.forEach((e: Error, i: number) =>
            console.error(`  [${i}]`, e.message || e)
        );
        if ((err as AggregateError).cause) console.error("  cause:", (err as AggregateError).cause);
    } else {
        console.error("Unhandled Error:", err);
    }

    return res.status(500).json({
        error: "Something went wrong. Please try again",
    });
};