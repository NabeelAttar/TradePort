// authentication code for user, seller and admin
import { NextFunction, Request, Response } from 'express';
import { validateRegistrationData } from '../utils/auth.helper';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';

// register a new user 
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    validateRegistrationData(req.body, "user");

    const {name, email} = req.body;

    const existingUser = await prisma.users.findUnique({where: email}); //finds a user with this email

    if(existingUser){
        return next(new ValidationError("User already exists with this email!"));
    }

    // send otp to email
}