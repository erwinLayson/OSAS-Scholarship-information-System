const nodemailer = require("nodemailer");
const { getEnv } = require('../../config/env');

const systemEmail = getEnv('SYSTEM_GMAIL');

const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: getEnv('PRIVATE_GMAIL'),
        pass: getEnv('APP_CODE')
    }
});

async function approvalMail(subject, text, info) {
    try {
        const mail = await mailer.sendMail({
            from: systemEmail,
            to: info.email,
            subject,
            text,
            html: `<div> <h1> Your Acount </h1> <br> <p>username: ${info.username} </p><p>password: ${info.password} </p></div>`
        })

        console.log("Email sent", mail.messageId);
        return mail
    } catch (err) {
        console.log(err.message);
    }
}


const rejectionMail = async (to, subject, text, content) => {
    try {
        const mail = await mailer.sendMail({
            from: systemEmail,
            to,
            subject,
            text,
            html: `<div> <h1>Your application is rejected </h1> <br> <p>${content}</p></div>`
        })

        console.log("Email sent", mail.messageId);
        return mail
    } catch (err) {
        console.log(err.message);
    }
}

async function sendScholarshipMail(subject, to, text) {
    try {
        const mail = await mailer.sendMail({
            from: systemEmail,
            to,
            subject,
            text
        })
        console.log(mail.messageId);
        return mail;
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {
    approvalMail,
    rejectionMail,
    sendScholarshipMail
}