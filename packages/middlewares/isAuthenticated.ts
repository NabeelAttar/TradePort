import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import Jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
    try { 
        const token = req.cookies.access_token || req.headers.authorization?.split(" ")[1]; //the later one is for our testing mechanism
        if(!token){
            return res.status(401).json({message: "Unauthorized. Token missing."});
        }

        // verify the token
        const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {id: string, role: "user" | "seller"};
        if(!decoded){
            return res.status(401).json({message: "Unauthorized. Invalid Token."});
        }

        const user = await prisma.users.findUnique({where : { id : decoded.id }});
        req.user = user;

        if(!user){
            return res.status(401).json({message : "Account not found!"});
        }

        return next();

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Token expired or invalid."});
    }
}

export default isAuthenticated;
