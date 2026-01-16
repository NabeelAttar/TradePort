// a utility function for authentication - to avoid writing the same function multiple times for user, sellers and admin
import cryto from 'crypto';
import { ValidationError } from '@packages/error-handler';
import { NextFunction, Request, Response } from 'express';
import redis from '@packages/libs/redis';
import { sendEmail } from './sendmail';
import prisma from '@packages/libs/prisma';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateRegistrationData = (data: any, userType: "user" | "seller") => {
    const { name, email, password, phone_number, country } = data;

    if(!name || !email || !password || (userType == "seller" && (!phone_number || !country))){
        throw new ValidationError(`Missing required fields!`);
    }

    if(!emailRegex.test(email)){
        throw new ValidationError("Invalid email format!");
    }
}

export const checkOtpRestrictions = async (email: string, next: NextFunction) => {
    if(await redis.get(`otp_lock:${email}`)){
        throw new ValidationError("Account locked due to multiple failed attemts! Try again after 30 minutes");
    }
    if(await redis.get(`otp_spam_lock:${email}`)){
        throw new ValidationError("Too many otp requests. Please wait 1 hour before requesting again.")
            // if a user sends 2 requests in the same minute and this happens 3 times then his account will be locked for 1 hour
    }
    if(await redis.get(`otp_cooldown:${email}`)){
        throw new ValidationError("Please wait 1 minute before requesting a new OTP!")
    }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpRequests >= 2){
        // this is the 3rd attempt, 3 timese email have been sent, means previously user has entered wrong otp 2 times
        // this is the 3rd mail, user can enter the correct or wrong otp either way we have to lock it for an hour
        await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
        throw new ValidationError("Too Many Requests. Please wait 1 hour before requesting again.");
    }
    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //increasing number of requests by 1 each time a request is sent, and this key value stays in the db fro an hour
}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = cryto.randomInt(1000, 9999).toString();

    // set this otp in our redis database with our email, redis- secondary db used for cached/short term data
    await sendEmail(email, "Verify your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300); 
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); 
    // so if at t sec otp is generated, it is stored at t sec, at t + 300 secs this otp expires that is it becomes invalid, 
    // and at t + 60 sec resend otp option becomes clickable, so the cooldown time is 60 secs, and once resend otp is clicked, it overwrites
    // the old otp value.
}

export const verifyOtp = async (email: string, otp: string, next: NextFunction) => {
    const storedOTP = await redis.get(`otp:${email}`);
    console.log(email);
    
    if(!storedOTP){
        throw new ValidationError("Invalid or Expired OTP!");
    }

    const failedAttemptsKey = `otp_failed_attempts:${email}`;
    const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

    if(storedOTP !== otp){
        if(failedAttempts >= 2){
            await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
            await redis.del(`otp:${email}`, failedAttemptsKey);
            throw new ValidationError("Too many failed attempts. Your account is locked for 30 minutes!")
        }
        await redis.set(failedAttemptsKey, failedAttempts+1, "EX", 300);
        throw new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts remaining!`)
    }

    await redis.del(`otp:${email}`, failedAttemptsKey);
}

export const handleForgotPassword = async (req: Request, res: Response, userType: "user" | "seller", next: NextFunction) => {
    try {
        const { email } = req.body
        if(!email){
            throw new ValidationError("Email is required!");
        }

        const user = userType === "user" && await prisma.users.findUnique({ where : { email } } );
        if(!user){
            throw new ValidationError(`${userType} is not found!`);
        }

        // check otp restrictions - as for forgot password we are sending otp
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);

        // generate otp and sendmail
        await sendOtp(user.name, email, "forgot-password-user-mail");

        res.status(200).json({
            message: "OTP sent to mail, please verify your account.",
        });

    } catch (error) {
        return next(error);
    }
}

export const verifyForgotPasswordOTP = async ( req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp }= req.body;
        if(!email || !otp){
            throw new ValidationError("Email and OTP are required!");
        }

        await verifyOtp(email, otp, next);

        res.status(200).json({
            message: "OTP verified. You can reset your password."
        })

    } catch (error) {
        return next(error);
    }
}