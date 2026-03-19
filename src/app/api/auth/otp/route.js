import { NextResponse } from 'next/server';
import { sendOTPEmail } from '@/lib/mail';

/**
 * OTP API - Send and Verify OTP codes via email
 * 
 * POST /api/auth/otp
 * Body: { action: 'send', email: '...' } — Generates and sends OTP
 * Body: { action: 'verify', email: '...', otp: '...' } — Verifies OTP
 */

// In-memory OTP store (for production, use Redis or DB)
// Format: { email: { code: '123456', expiresAt: Date, attempts: 0 } }
const otpStore = global.__otpStore || (global.__otpStore = new Map());

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export async function POST(req) {
    try {
        const { action, email, otp } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ========== SEND OTP ==========
        if (action === 'send') {
            // Rate limiting: don't allow re-send within 30 seconds
            const existing = otpStore.get(normalizedEmail);
            if (existing && existing.sentAt && (Date.now() - existing.sentAt) < 30000) {
                const waitSeconds = Math.ceil((30000 - (Date.now() - existing.sentAt)) / 1000);
                return NextResponse.json({ 
                    success: false, 
                    message: `Please wait ${waitSeconds} seconds before requesting a new code` 
                }, { status: 429 });
            }

            const code = generateOTP();
            
            // Store OTP with 5-minute expiry
            otpStore.set(normalizedEmail, {
                code,
                expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
                attempts: 0,
                sentAt: Date.now(),
            });

            // Send email using the shared mail transporter
            try {
                await sendOTPEmail({ email: normalizedEmail, otp: code });
                console.log(`OTP sent successfully to ${normalizedEmail}`);
            } catch (emailError) {
                console.error('Failed to send OTP email:', emailError);
                otpStore.delete(normalizedEmail);
                return NextResponse.json({ 
                    success: false, 
                    message: 'Failed to send verification code. Please try again.' 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                message: 'Verification code sent to your email' 
            }, { status: 200 });
        }

        // ========== VERIFY OTP ==========
        if (action === 'verify') {
            if (!otp) {
                return NextResponse.json({ success: false, message: 'Verification code is required' }, { status: 400 });
            }

            const stored = otpStore.get(normalizedEmail);

            if (!stored) {
                return NextResponse.json({ 
                    success: false, 
                    message: 'No verification code found. Please request a new one.' 
                }, { status: 400 });
            }

            // Check expiry
            if (Date.now() > stored.expiresAt) {
                otpStore.delete(normalizedEmail);
                return NextResponse.json({ 
                    success: false, 
                    message: 'Verification code has expired. Please request a new one.' 
                }, { status: 400 });
            }

            // Check max attempts (5 attempts max)
            if (stored.attempts >= 5) {
                otpStore.delete(normalizedEmail);
                return NextResponse.json({ 
                    success: false, 
                    message: 'Too many failed attempts. Please request a new code.' 
                }, { status: 429 });
            }

            // Verify code
            if (stored.code !== otp.trim()) {
                stored.attempts += 1;
                const remaining = 5 - stored.attempts;
                return NextResponse.json({ 
                    success: false, 
                    message: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` 
                }, { status: 400 });
            }

            // OTP is valid! Clean up
            otpStore.delete(normalizedEmail);

            return NextResponse.json({ 
                success: true, 
                message: 'Verification successful' 
            }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('OTP API error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
