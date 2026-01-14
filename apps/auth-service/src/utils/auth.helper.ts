// a utility function for authentication - to avoid writing the same function multiple times for user, sellers and admin
import cryto from 'crypto';
import { ValidationError } from '../../../../packages/error-handler';
import { NextFunction } from 'express';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendmail';

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
        return next(
            new ValidationError("Account locked due to multiple failed attemts! Try again after 30 minutes")
        );
    }
    if(await redis.get(`otp_spam_lock:${email}`)){
        return next(
            new ValidationError("Too many otp requests. Please wait 1 hour before requesting again.")
            // if a user sends 2 requests in the same minute and this happens 3 times then his account will be locked for 1 hour
        );
    }
    if(await redis.get(`otp_cooldown: ${email}`)){
        return next(
            new ValidationError("Please wait 1 minute before requesting a new OTP!")
        );
    }
}

export const trackOtpRequests = async (email: string, next: NextFunction) => {
    const otpRequestKey = `otp_request_count: ${email}`;
    let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpRequests >= 2){
        // this is the 3rd attempt, 3 timese email have been sent, means previously user has entered wrong otp 2 times
        // this is the 3rd mail, user can enter the correct or wrong otp either way we have to lock it for an hour
        await redis.set(`otp_spam_lock: ${email}`, "locked", "EX", 3600);
        return next(
            new ValidationError("Too Many Requests. Please wait 1 hour before requesting again.")
        ); 
    }
    await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //increasing number of requests by 1 each time a request is sent, and this key value stays in the db fro an hour
}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = cryto.randomInt(1000, 9999).toString();

    // set this otp in our redis database with our email, redis- secondary db used for cached/short term data
    await sendEmail(email, "Verify your Email", template, {name, otp});
    await redis.set(`otp: ${email}`, otp, "EX", 300); 
    await redis.set(`otp_cooldown: ${email}`, "true", "EX", 60); 
    // so if at t sec otp is generated, it is stored at t sec, at t + 300 secs this otp expires that is it becomes invalid, 
    // and at t + 60 sec resend otp option becomes clickable, so the cooldown time is 60 secs, and once resend otp is clicked, it overwrites
    // the old otp value.
}
