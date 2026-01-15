// authentication code for user, seller and admin
import { NextFunction, Request, Response } from 'express';
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData, verifyOtp } from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import { ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';

// register a new user 
export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "user");

        const {name, email} = req.body;

        const existingUser = await prisma.users.findUnique({where: { email }}); //finds a user with this email

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

// verify user with otp
export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name, otp } = req.body;
        if(!email || !password || !name || !otp){
            throw new ValidationError("All fields are required!");
        }
        
        const existingUser = await prisma.users.findUnique({where : {email}});
        if(existingUser){
            throw new ValidationError("User already exists with this email!");
        }
        
        await verifyOtp(email, otp, next);

        const hashedPassword = await bcrypt.hash(password, 10);

        // create account as all security checks are done
        const user = await prisma.users.create({
            data: {name, email, password: hashedPassword},
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        })

    } catch (error) {
        return next(error);
    }
}

