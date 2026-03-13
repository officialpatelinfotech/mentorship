
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const env = {};
envLines.forEach(line => {
    if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    }
});

async function testPlain() {
    const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_PORT === '465',
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Sending PLAIN TEXT ONLY email to k1183067@gmail.com...');
        const info = await transporter.sendMail({
            from: env.SMTP_USER,
            to: 'k1183067@gmail.com',
            subject: 'CRITICAL: Plain Text Diagnostic Test',
            text: 'This is a 100% plain text email with NO HTML. If you receive this, it means Gmail is blocking the HTML version. If you do NOT receive this, it means your domain is blocked by Gmail.',
            envelope: {
                from: env.SMTP_USER,
                to: 'k1183067@gmail.com'
            }
        });
        
        console.log('Email Sent: SUCCESS');
        console.log('Message ID:', info.messageId);
        process.exit(0);
    } catch (error) {
        console.error('SMTP Error:', error);
        process.exit(1);
    }
}

testPlain();
