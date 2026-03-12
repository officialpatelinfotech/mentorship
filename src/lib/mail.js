import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const APP_NAME = "Dishanta";
const ADMIN_EMAIL = process.env.CONTACT_EMAIL_RECEIVER;

const commonStyles = `
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
`;

const containerStyles = `
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #e1e8ed;
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const headerStyles = `
    padding-bottom: 20px;
    border-bottom: 1px solid #f0f4f8;
    margin-bottom: 20px;
`;

const footerStyles = `
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #f0f4f8;
    color: #999;
    font-size: 14px;
`;

/**
 * Send Signup Welcome Email to User and Alert to Admin
 */
export async function sendSignupEmails({ name, email, role }) {
    // 1. To User
    const userMail = {
        from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Welcome to ${APP_NAME}!`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <div style="${headerStyles}">
                        <h2 style="margin:0; color:#1a1a1a;">${APP_NAME}</h2>
                    </div>
                    <h3>Hello, ${name}!</h3>
                    <p>Welcome to ${APP_NAME}. We're excited to have you join our mentorship community as a <strong>${role}</strong>.</p>
                    <p>Start exploring our platform to connect with top MBA professionals and accelerate your career journey.</p>
                    <div style="${footerStyles}">
                        <p>Best Regards,<br/>Team ${APP_NAME}</p>
                    </div>
                </div>
            </div>
        `,
    };

    // 2. To Admin
    const adminMail = {
        from: `"${APP_NAME} System" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `New User Registration: ${name}`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <h3>New Signup Alert</h3>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Role:</strong> ${role}</p>
                    <p>Registration time: ${new Date().toLocaleString()}</p>
                </div>
            </div>
        `,
    };

    const results = [];
    
    // 1. To User (Welcome)
    try {
        console.log(`Sending welcome email to: ${email}`);
        results.push(await transporter.sendMail(userMail));
    } catch (err) {
        console.error(`Failed to send welcome email to ${email}:`, err);
    }

    // 2. To Admin (Signup Alert)
    try {
        console.log(`Sending admin signup alert to: ${ADMIN_EMAIL}`);
        results.push(await transporter.sendMail(adminMail));
    } catch (err) {
        console.error(`Failed to send admin signup alert:`, err);
    }

    return results;
}

/**
 * Send Booking Confirmation to Candidate, Mentor, and Admin
 */
export async function sendBookingEmails({ 
    candidateName, candidateEmail, 
    mentorName, mentorEmail, 
    sessionDate, sessionTime, 
    sessionReason 
}) {
    // 1. To Candidate
    const candidateMail = {
        from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
        to: candidateEmail,
        subject: `Booking Confirmed: Session with ${mentorName}`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <div style="${headerStyles}">
                        <h2 style="margin:0; color:#1a1a1a;">${APP_NAME}</h2>
                        <p style="color:#666; font-size:14px;">Booking Confirmation</p>
                    </div>
                    <h3>Hi ${candidateName},</h3>
                    <p>Your mentorship session has been successfully booked!</p>
                    <div style="background:#f8fbff; padding:20px; border-radius:8px; border:1px solid #e9f2ff; margin:20px 0;">
                        <p style="margin:5px 0;"><strong>Mentor:</strong> ${mentorName}</p>
                        <p style="margin:5px 0;"><strong>Date:</strong> ${sessionDate}</p>
                        <p style="margin:5px 0;"><strong>Time:</strong> ${sessionTime}</p>
                        <p style="margin:5px 0;"><strong>Reason:</strong> ${sessionReason}</p>
                    </div>
                    <p>You can join the session directly from your user profile at the scheduled time.</p>
                    <div style="${footerStyles}">
                        <p>— ${APP_NAME}</p>
                    </div>
                </div>
            </div>
        `,
    };

    // 2. To Mentor
    const mentorMail = {
        from: `"${APP_NAME}" <${process.env.SMTP_USER}>`,
        to: mentorEmail,
        subject: `New Session Booking: ${candidateName}`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <div style="${headerStyles}">
                        <h2 style="margin:0; color:#1a1a1a;">${APP_NAME}</h2>
                        <p style="color:#666; font-size:14px;">New Booking Alert</p>
                    </div>
                    <h3>Hello ${mentorName},</h3>
                    <p>You have a new mentorship session scheduled with <strong>${candidateName}</strong>.</p>
                    <div style="background:#f8fbff; padding:20px; border-radius:8px; border:1px solid #e9f2ff; margin:20px 0;">
                        <p style="margin:5px 0;"><strong>Candidate:</strong> ${candidateName}</p>
                        <p style="margin:5px 0;"><strong>Date:</strong> ${sessionDate}</p>
                        <p style="margin:5px 0;"><strong>Time:</strong> ${sessionTime}</p>
                        <p style="margin:5px 0;"><strong>Topic:</strong> ${sessionReason}</p>
                    </div>
                    <p>Wait for the scheduled time and join the session via your dashboard.</p>
                    <div style="${footerStyles}">
                        <p>— ${APP_NAME}</p>
                    </div>
                </div>
            </div>
        `,
    };

    // 3. To Admin
    const adminMail = {
        from: `"${APP_NAME} System" <${process.env.SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `New Session Scheduled: ${candidateName} & ${mentorName}`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <h3>New Session Alert</h3>
                    <p>A new mentorship session has been booked on the platform.</p>
                    <p><strong>Mentor:</strong> ${mentorName}</p>
                    <p><strong>Candidate:</strong> ${candidateName}</p>
                    <p><strong>Scheduled:</strong> ${sessionDate} at ${sessionTime}</p>
                </div>
            </div>
        `,
    };

    const results = [];

    // 1. To Candidate (Confirmation)
    try {
        console.log(`Sending booking confirmation to Candidate: ${candidateEmail}`);
        results.push(await transporter.sendMail(candidateMail));
    } catch (err) {
        console.error(`Failed to send candidate booking email:`, err);
    }

    // 2. To Mentor (Alert)
    try {
        console.log(`Sending booking alert to Mentor: ${mentorEmail}`);
        results.push(await transporter.sendMail(mentorMail));
    } catch (err) {
        console.error(`Failed to send mentor booking email:`, err);
    }

    // 3. To Admin (Platform Alert)
    try {
        console.log(`Sending admin booking alert to: ${ADMIN_EMAIL}`);
        results.push(await transporter.sendMail(adminMail));
    } catch (err) {
        console.error(`Failed to send admin booking alert:`, err);
    }

    return results;
}

/**
 * Send Contact Form Emails (User Receipt and Admin Alert)
 */
export async function sendContactEmails({ name, email, phone, subject, message }) {
    // 1. To Admin
    const adminMail = {
        from: `"Dishanta Support" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: ADMIN_EMAIL,
        subject: `New Inquiry: ${subject || 'General'}`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <h2 style="color:#333;">New Inquiry Received</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                    <div style="background:#f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br/>')}</p>
                    </div>
                </div>
            </div>
        `,
    };

    // 2. To User
    const userMail = {
        from: `"Dishanta" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `We received your enquiry - Dishanta`,
        html: `
            <div style="${commonStyles}">
                <div style="${containerStyles}">
                    <div style="${headerStyles}">
                        <h2 style="margin:0; color:#1a1a1a;">Dishanta</h2>
                        <p style="margin:5px 0 0; color:#666; font-size:14px;">Enquiry confirmation</p>
                    </div>
                    <h3>Thanks, ${name}!</h3>
                    <p>We received your enquiry and our team will reach out soon.</p>
                    <div style="margin-top:30px; background-color:#f8fbff; border:1px solid #e9f2ff; border-radius:8px; padding:20px;">
                        <p style="margin:0 0 10px; font-size:13px; color:#888; text-transform:uppercase; letter-spacing:1px;">Your details</p>
                        <p style="margin:5px 0; font-size:15px; color:#333;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                        <p style="margin:5px 0; font-size:15px; color:#333;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
                    </div>
                    <div style="${footerStyles}">
                        <p>— Dishanta</p>
                    </div>
                </div>
            </div>
        `,
    };

    const results = [];

    // 1. To Admin (Inquiry Alert)
    try {
        console.log(`Sending contact inquiry alert to: ${ADMIN_EMAIL}`);
        results.push(await transporter.sendMail(adminMail));
    } catch (err) {
        console.error(`Failed to send contact admin alert:`, err);
    }

    // 2. To User (Receipt Confirmation)
    try {
        console.log(`Sending contact receipt to User: ${email}`);
        results.push(await transporter.sendMail(userMail));
    } catch (err) {
        console.error(`Failed to send contact user receipt:`, err);
    }

    return results;
}
