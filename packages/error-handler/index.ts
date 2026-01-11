export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(message: string, statusCode: number, isOperational = true, details?: any){
        super(message); //super calls the constructor of the parent class (AppError).
        this.statusCode = statusCode;
        this.isOperational = isOperational; //is true when it is an expected error and not a bug
        this.details = details;
        Error.captureStackTrace(this);
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found"){
        super(message, 404);
    }
}

// validation errror (used in joi/zod/ react-hook-form)
export class ValidationError extends AppError {
    constructor(message = "Invalid request data", details?: any){
        super(message, 400, true, details);
    }
}

// authentication error for jwt
export class AuthError extends AppError {
    constructor(message = "Unauthorized request"){
        super(message, 401);
    }
}

// forbidden error - impossible requests - like requests supposed to be made to admin but im a seller
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden access"){
        super(message, 403);
    }
}

// database error - for mongoDB
export class DatabaseError extends AppError {
    constructor(message = "Database error", details?: any){
        super(message, 500, true, details);
    }
}

// if user exceeds api limits
export class RateLimitingError extends AppError {
    constructor(message = "Too many requests, please try again later"){
        super(message, 429);
    }
}