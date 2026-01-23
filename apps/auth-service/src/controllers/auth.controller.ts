// authentication code for user, seller and admin
import { NextFunction, Request, Response } from 'express';
import { checkOtpRestrictions, handleForgotPassword, sendOtp, trackOtpRequests, validateRegistrationData, verifyForgotPasswordOTP, verifyOtp } from '../utils/auth.helper';
import prisma from '@packages/libs/prisma';
import { AuthError, ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import { setCookie } from '../utils/cookies/setCookie';

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

// login user
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return next(new ValidationError("Email and password are required fields!"));
        }

        const user = await prisma.users.findUnique({where: { email }});
        if(!user){
            return next(new AuthError("User does not exist"));
        }

        // verify password
        const isMatch = await bcrypt.compare(password, user.password!); //! says that ik user.password isnt null, it is string, 
        // eearlier it was giving error thinking it could be null, and bcrypt.compare method cant compare with null values 
        if(!isMatch){
            return next(new AuthError("Incorrect email or password!"));
        }

        // generate access and refresh tokens
        const accessToken = jwt.sign(
            {id: user.id, role: "user"}, 
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m",
            }    
        );
        const refreshToken = jwt.sign(
            {id: user.id, role: "user"}, 
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d",
            }    
        );

        // store the refresh and access token in an httpOnly secure cookie
        setCookie(res, "refresh_token", refreshToken);
        setCookie(res, "access_token", accessToken);

        res.status(200).json({
            message: "Login Successful",
            user: {id: user.id, email: user.email, name: user.name}
        });

    } catch (error) {
        return next(error);
    }
}

// refresh token user
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if(!refreshToken){
            return new ValidationError("Unauthorized. No refresh Token.");
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as {id: string, role: string};
        if(!decoded || !decoded.id || !decoded.role){
            return new JsonWebTokenError("Forbidden! Invalid Refresh Token.");
        }

        const user = await prisma.users.findUnique({ where : {id : decoded.id } });
        if(!user){
            return new AuthError("Forbidden! User/Seller not found.");
        }

        // everything is fine now generate a new accessToken
        const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: "15m" });
        
        setCookie(res, "access_token", newAccessToken);

        return res.status(201).json({ success: true });

    } catch (error) {
        return next(error);
    }
}

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        return next(error);
    }
}

// user forgot password
export const userForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    await handleForgotPassword(req, res, "user", next);
}

// verify forgotpassword otp
export const verifyUserForgotPassword = async(req: Request, res: Response, next: NextFunction) => {
    await verifyForgotPasswordOTP(req, res, next);
}

// reset user password
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, newPassword } = req.body;
        if(!email || !newPassword){
            return next(new ValidationError("Email and new Password are required!"));
        }

        const user = await prisma.users.findUnique({ where : { email } } );
        if(!user){
            return next(new ValidationError("User not found!"));
        }

        // compare new password with existing one
        const isSamePassword = await bcrypt.compare(newPassword, user.password!);
        if(isSamePassword){
            return next(new ValidationError("New Password cannot be same as Old password!"));
        }

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.users.update({
            where: {email},
            data: { password: hashedPassword },
        });

        res.status(200).json({
            message: "Password reset successful."
        })

    } catch (error) {
        return next(error);
    }
}

