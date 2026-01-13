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

export const checkOtpRestrictions = (email: String, next: NextFunction) => {

}

export const sendOtp = async (name: string, email: string, template: string) => {
    const otp = cryto.randomInt(1000, 9999).toString();

    // set this otp in our redis database with our email, redis- secondary db used for cached/short term data
    await sendEmail(email, "Verify your Email", template, {name, otp});
    await redis.set(`otp: ${email}`, otp, "EX", 300); //the value for key "otp" is the current email and next is generated otp which is
    // passed and then we have set expired time , that is otp limit of 300sec

    await redis.set(`otp_cooldown: ${email}`, "true", "EX", 60); // you can only send only one otp each minute


}