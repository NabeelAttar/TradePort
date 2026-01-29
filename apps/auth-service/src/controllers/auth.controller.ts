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
        await prisma.users.create({
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

// from here we start seller api routes
// register a new seller
export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        validateRegistrationData(req.body, "seller");
        const {name, email} = req.body;

        const existingSeller = await prisma.sellers.findUnique({where: {email}});
        if(existingSeller){
            throw new ValidationError("Seller already exists with this email.");
        }
        
        await checkOtpRestrictions(email, next);
        await trackOtpRequests(email, next);
        await sendOtp(name, email, "seller-activation-mail");
        
        res.status(200).json({
            message: "OTP sent to email. Please verify your account."
        })

    } catch (error) {
        next(error);
    }
}

// verify seller with otp
export const verifySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp, password, name, phone_number, country} = req.body;
        if(!email || !otp || !password || !name || !phone_number || !country){
            return next(new ValidationError("All field are required."));
        }

        const existingSeller = await prisma.sellers.findUnique({where: {email}});
        if(existingSeller){
            return next(new ValidationError("Seller already exists with this email."));
        }
        
        await verifyOtp(email, otp, next);
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const seller = await prisma.sellers.create({
            data: {
                name, 
                email,
                password: hashedPassword,
                country,
                phone_number
            }
        });

        res.status(201).json({
            seller,
            message: "Seller registered Successfully!"
        });
        
    } catch (error) {
        next(error);
    }
}

// creating a new shop
export const createShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, bio, address, opening_hours, website, category, sellerId} = req.body;
        if(!name || !bio || !address || !sellerId || !opening_hours || !category){
            return next(new ValidationError("All fields are required."));
        }

        const shopData: any = {
            name, 
            bio,
            address,
            opening_hours,
            category,
            sellerId
        };
        
        if(website && website.trim() !== ""){
            shopData.website = website
        }

        const shop = await prisma.shops.create({
            data: shopData
        })

        res.status(201).json({
            success: true,
            shop,
        });
        
    } catch (error) {
        next(error);
    }
}

// Utility function to generate unique bank account ID
// This mocks what Stripe's accounts.create() does - creates a unique identifier for the account
const generateBankAccountId = (): string => {
    // Format: bank_<timestamp>_<random>
    // Similar to Stripe's account IDs like "acct_1234567890"
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `bank_${timestamp}_${random}`;
};

// create bank account for seller (replaces Stripe Connect)
export const createBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sellerId, bankAccountCountry, accountCurrency, accountNumber } = req.body;
        
        if (!sellerId || !bankAccountCountry || !accountCurrency || !accountNumber) {
            return next(new ValidationError("All fields are required!"));
        }

        // Validate account number is 8 digits
        if (!/^\d{8}$/.test(accountNumber)) {
            return next(new ValidationError("Account number must be 8 digits!"));
        }

        const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
        if (!seller) {
            return next(new AuthError("Seller not found"));
        }

        // Mock: Generate bank account ID (similar to stripe.accounts.create())
        // This represents creating an "account" in a payment system
        const bankAccountId = generateBankAccountId();

        // Update seller with bank account information
        const updatedSeller = await prisma.sellers.update({
            where: { id: sellerId },
            data: {
                bankId: bankAccountId, // Store our generated bank account ID
                bankAccountNumber: accountNumber,
                bankAccountCountry: bankAccountCountry,
                accountCurrency: accountCurrency,
                bankAccountStatus: "pending", // Status starts as pending, will be verified after KYC
            },
        });

        if (!updatedSeller) {
            return next(new ValidationError("Failed to update seller with bank account"));
        }

        // Mock: Create account link response (similar to stripe.accountLinks.create())
        // This is a response object only, not stored in DB. It indicates successful account creation.
        // The actual bankAccountStatus is stored in the sellers collection.
        const accountLink = {
            id: `link_${bankAccountId}`,
            object: "account_link",
            created: Date.now(),
            expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            url: `${process.env.FRONTEND_URI || "http://localhost:3000"}/success`,
            type: "account_onboarding",
            status: "complete", // Response status (not DB status)
        };

        res.status(201).json({
            success: true,
            message: "Bank account connected successfully",
            accountLink: {
                url: accountLink.url,
            },
            seller: {
                id: updatedSeller.id,
                name: updatedSeller.name,
                email: updatedSeller.email,
                bankAccountId: bankAccountId,
            },
        });
    } catch (error) {
        return next(error);
    }
}

// login seller
export const loginSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return next(new ValidationError("Email and password are required fields!"));
        }

        const seller = await prisma.sellers.findUnique({where: { email }});
        if(!seller){
            return next(new AuthError("Invalid email or password"));
        }
        
        // verify password
        const isMatch = await bcrypt.compare(password, seller.password!); //! says that ik user.password isnt null, it is string, 
        // eearlier it was giving error thinking it could be null, and bcrypt.compare method cant compare with null values 
        if(!isMatch){
            return next(new AuthError("Incorrect email or password!"));
        }

        // generate access and refresh tokens
        const accessToken = jwt.sign(
            {id: seller.id, role: "seller"}, 
            process.env.ACCESS_TOKEN_SECRET as string,
            {
                expiresIn: "15m",
            }    
        );
        const refreshToken = jwt.sign(
            {id: seller.id, role: "seller"}, 
            process.env.REFRESH_TOKEN_SECRET as string,
            {
                expiresIn: "7d",
            }    
        );

        // store the refresh and access token in an httpOnly secure cookie - as this is a microservices project and the 
        // main website is on lets say tradeport.com then seller website is on seller.tradeport.com , so, if user logs in the same 
        // system then seller will automatically logout because the cookie name is same - access_token and refresh_token, hence we will use different cookie names
        setCookie(res, "seller_refresh_token", refreshToken);
        setCookie(res, "seller_access_token", accessToken);

        res.status(200).json({
            message: "Login Successful",
            user: {id: seller.id, email: seller.email, name: seller.name}
        });

    } catch (error) {
        return next(error);
    }
}

// get loggedin seller
export const getSeller = async (req: any, res: Response, next: NextFunction) => {
    try {
        const seller = req.seller;
        res.status(201).json({
            success: true,   
            seller,
        });
    } catch (error) {
        next(error);
    }
}

