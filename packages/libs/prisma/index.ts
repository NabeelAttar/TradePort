// mongoose - ODM - object document mapper - MongoDB stores documents, not tables.
// So Mongoose maps: JavaScript Objects  ⇄  MongoDB Documents

// prisma - ORM - object relational mapper - is the middleman between js/ts code and database, instead of writing string db queries like
// db.query(`SELECT * FROM users WHERE email = 'a@b.com'`); we write :
// prisma.user.findUnique({
//   where: { email: "a@b.com" }
// });
// this forces structured data , schema - and hence people prefer this 

import { PrismaClient } from "@prisma/client";
// this PrismaClient is the object that talks to our databse 
declare global {
    namespace globalThis {
        var prismadb : PrismaClient;
    }
}
// initialized a global variable called globalThis.prismadb, and its type is PrismaClient

const prisma = new PrismaClient();
// Creates one Prisma client instance

if(process.env.NODE_ENV === "production") global.prismadb = prisma;
// In production, you store the Prisma instance on the global object

export default prisma;

// What this code is TRYING to do: It wants: One PrismaClient. Shared globally. No duplicate connections. This is called a singleton pattern.
