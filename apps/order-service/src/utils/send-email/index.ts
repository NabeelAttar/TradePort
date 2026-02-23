import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import ejs from 'ejs' //ejs - embedded javascript templates -Used to generate HTML emails dynamically
import path from 'path' //Safely builds file paths across different OS

dotenv.config();

const transporter = nodemailer.createTransport({
    // here we create an SMTP client, transporter is the object that actaully sends emails 
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
// arguemnts are templateName : the ejs template name , here something like "verify-email"
// Record<string, any> = “An object with string keys and any values”
// returns a promise that resolves to html string
const renderEmailTemplate = async (templateName: string, data: Record<string, any>) : Promise<string> => {
    const templatePath = path.join( //Builds absolute file path safely
        process.cwd(), //return working directory of the current process 
        "apps",
        "auth-service",
        "src",
        "utils",
        "email-templates", //this is the folder structure where templates live, auth-service/src/utils/email-templates
        `${templateName}.ejs`
    );
    // templatePath is now a full absolute path.
    return ejs.renderFile(templatePath, data); 
    // Reads .ejs file, Injects data, Produces final HTML string which is the html body of the email, specifying a template a structure of the email
}

// send an email using nodemailer
export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, any>) => {
    try {
        const html = await renderEmailTemplate(templateName, data); //Converts EJS template → HTML

        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}>`,
            to: to,
            subject,
            html, //html body of the email
        }); //Sends email via SMTP
        return true;
    } catch (error) {
        console.log("Error sending Email", error);
        return false;
    }
};

// This file sends templated HTML emails using SMTP and EJS templates.