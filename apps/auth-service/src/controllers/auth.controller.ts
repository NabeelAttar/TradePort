// authentication code for user, seller and admin
import { NextFunction, Request, Response } from 'express';
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from '../utils/auth.helper';
import prisma from '../../../../packages/libs/prisma';
import { ValidationError } from '../../../../packages/error-handler';

// register a new user 
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");

        const {name, email} = req.body;

        const existingUser = await prisma.users.findUnique({where: email}); //finds a user with this email

        if(existingUser){
            return next(new ValidationError("User already exists with this email!"));
        }

        // send otp to email
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next); //this will also do the work of forgot password and reset password , as there is otps there is no need of forgot password
        await sendOtp(name, email, "user-activation-mail");

        res.status(200).json({
            message: "OTP send to your email. Please verify your account.",
        });
    } catch (error) {
        return next(error);
    }
};