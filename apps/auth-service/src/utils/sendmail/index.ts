import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import ejs from 'ejs' //ejs - embedded javascript templates -Used to generate HTML emails dynamically
import path from 'path' //Safely builds file paths across different OS

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});
// creates an SMTP client 

// render an ejs email template 
// Record<string, any> = “An object with string keys and any values”
const renderEmailTemplate = async (templateName: string, data: Record<string, any>) : Promise<string> => {
    const templatePath = path.join( //Builds absolute file path safely
        process.cwd(), //return current working directory pf the current process 
        "auth-service",
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`
    );

    return ejs.renderFile(templatePath, data); 
    // Reads .ejs file, Injects data, Produces final HTML string
}

// send an email using nodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data); //Converts EJS template → HTML

        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}>`,
            to: to,
            subject,
            html,
        }); //Sends email via SMTP
        return true;
    } catch (error) {
        console.log("Error sending Email", error);
        return false;
    }
};

// This file sends templated HTML emails using SMTP and EJS templates.