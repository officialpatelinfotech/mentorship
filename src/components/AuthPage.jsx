"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./AuthPage.css";
import { compressImage } from "@/lib/imageUtils";

const AuthPage = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const [photoPreview, setPhotoPreview] = useState(null);
    const [profPhotoPreview, setProfPhotoPreview] = useState(null);
    const [showExampleModal, setShowExampleModal] = useState(false);

    // OTP Verification State
    const [otpStep, setOtpStep] = useState(false); // true = show OTP screen
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [pendingEmail, setPendingEmail] = useState(""); // Email to which OTP was sent
    const otpInputRefs = useRef([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        identifier: "", // for login: email or phone
        phone: "",
        email: "",
        latestQualification: "",
        interest: "",
        qualification: "",
        profession: "",
        photo: "",
        professionalPhoto: "",
    });

    // OTP Resend Timer
    useEffect(() => {
        if (otpTimer > 0) {
            const interval = setInterval(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [otpTimer]);

    // Auto-focus first OTP input when OTP step is shown
    useEffect(() => {
        if (otpStep && otpInputRefs.current[0]) {
            setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        }
    }, [otpStep]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Max 15MB
        if (file.size > 15 * 1024 * 1024) {
            setFieldErrors({ ...fieldErrors, photo: "Photo must be less than 15MB" });
            return;
        }

        if (!file.type.startsWith("image/")) {
            setFieldErrors({ ...fieldErrors, photo: "Please upload an image file" });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressed = await compressImage(reader.result);
                setFormData((prev) => ({ ...prev, photo: compressed }));
                setPhotoPreview(compressed);
                setFieldErrors((prev) => ({ ...prev, photo: "" }));
            } catch (err) {
                console.error("Compression error:", err);
                setFieldErrors((prev) => ({ ...prev, photo: "Failed to process image" }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleProfPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            setFieldErrors({ ...fieldErrors, professionalPhoto: "Photo must be less than 15MB" });
            return;
        }
        if (!file.type.startsWith("image/")) {
            setFieldErrors({ ...fieldErrors, professionalPhoto: "Please upload an image file" });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressed = await compressImage(reader.result);
                setFormData((prev) => ({ ...prev, professionalPhoto: compressed }));
                setProfPhotoPreview(compressed);
                setFieldErrors((prev) => ({ ...prev, professionalPhoto: "" }));
            } catch (err) {
                console.error("Compression error:", err);
                setFieldErrors((prev) => ({ ...prev, professionalPhoto: "Failed to process image" }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Phone: allow only digits, spaces, + and -
        if (name === "phone") {
            const cleaned = value.replace(/[^0-9+\-\s]/g, "");
            setFormData({ ...formData, phone: cleaned });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear field-specific error on change
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: "" });
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMessage("");
        setFieldErrors({});
        setPhotoPreview(null);
        setProfPhotoPreview(null);
        setOtpStep(false);
        setOtpValues(["", "", "", "", "", ""]);
        setOtpError("");
        setFormData({ name: "", email: "", identifier: "", password: "", confirmPassword: "", role: "student", phone: "", latestQualification: "", interest: "", qualification: "", profession: "", photo: "", professionalPhoto: "" });
    };

    const validateForm = () => {
        const errors = {};

        if (!isLogin) {
            // Name validation
            if (!formData.name.trim()) {
                errors.name = "Full name is required";
            }

            // Role-specific validations
            if (formData.role === "student") {
                if (!formData.latestQualification) {
                    errors.latestQualification = "Please select your qualification";
                }
                if (!formData.interest) {
                    errors.interest = "Please select your area of interest";
                }
            } else if (formData.role === "professional") {
                if (!formData.qualification) {
                    errors.qualification = "Please select your qualification";
                }
                if (!formData.profession.trim()) {
                    errors.profession = "Profession is required";
                }
            }

            // Confirm password
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }
        }

        // Login Identifier validation (Email or Phone)
        if (isLogin) {
            if (!formData.identifier.trim()) {
                errors.identifier = "Email or Phone is required";
            }
        } else {
            // Email validation (Signup)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = "Enter a valid email address";
            }

            // Phone validation (Signup)
            const digitsOnly = formData.phone.replace(/[^0-9]/g, "");
            if (!digitsOnly || digitsOnly.length < 10 || digitsOnly.length > 15) {
                errors.phone = "Enter a valid phone number (10-15 digits)";
            }
        }

        // Password validation
        if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Determine the email to send OTP to
    const getEmailForOTP = () => {
        if (isLogin) {
            // For login, identifier could be email or phone
            // We need to extract email — if it looks like email, use it
            const identifier = formData.identifier.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(identifier)) {
                return identifier;
            }
            // If phone, we'll resolve email server-side
            return identifier;
        }
        return formData.email.trim();
    };

    // Step 1: Send OTP
    const sendOTP = async (emailForOtp) => {
        setIsSendingOtp(true);
        setOtpError("");
        
        try {
            const res = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "send", email: emailForOtp }),
            });

            const data = await res.json();

            if (res.ok) {
                setOtpTimer(30); // 30 second cooldown
                return true;
            } else {
                setOtpError(data.message || "Failed to send verification code");
                return false;
            }
        } catch (error) {
            console.error("OTP send error:", error);
            setOtpError("Failed to send verification code. Please try again.");
            return false;
        } finally {
            setIsSendingOtp(false);
        }
    };

    // Handle main form submit — validates & requests OTP
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            if (isLogin) {
                // For login: first validate credentials, then send OTP
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        identifier: formData.identifier, 
                        password: formData.password,
                        otpMode: true // Tell server to just validate, not login yet
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.message || "Invalid credentials.");
                    setIsSubmitting(false);
                    return;
                }

                // Credentials are valid, send OTP to the user's email
                const userEmail = data.email; // Server returns the user's email
                setPendingEmail(userEmail);
                
                const otpSent = await sendOTP(userEmail);
                if (otpSent) {
                    setOtpStep(true);
                }
            } else {
                // For signup: validate that user doesn't exist, then send OTP
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, otpMode: true }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setErrorMessage(data.message || "Registration check failed.");
                    setIsSubmitting(false);
                    return;
                }

                // Validation passed, send OTP
                const emailForOtp = formData.email.trim();
                setPendingEmail(emailForOtp);
                
                const otpSent = await sendOTP(emailForOtp);
                if (otpSent) {
                    setOtpStep(true);
                }
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // OTP Input Handlers
    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newValues = [...otpValues];
        newValues[index] = value;
        setOtpValues(newValues);
        setOtpError("");

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are filled
        if (value && index === 5) {
            const fullOtp = newValues.join("");
            if (fullOtp.length === 6) {
                verifyOTPAndComplete(fullOtp);
            }
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
        if (e.key === "Enter") {
            const fullOtp = otpValues.join("");
            if (fullOtp.length === 6) {
                verifyOTPAndComplete(fullOtp);
            }
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length === 0) return;

        const newValues = [...otpValues];
        for (let i = 0; i < pastedData.length; i++) {
            newValues[i] = pastedData[i];
        }
        setOtpValues(newValues);
        setOtpError("");

        // Focus the next empty or last input
        const nextIndex = Math.min(pastedData.length, 5);
        otpInputRefs.current[nextIndex]?.focus();

        // Auto-submit if all 6 digits pasted
        if (pastedData.length === 6) {
            verifyOTPAndComplete(pastedData);
        }
    };

    // Step 2: Verify OTP & Complete Auth
    const verifyOTPAndComplete = async (otpCode) => {
        setIsVerifying(true);
        setOtpError("");

        try {
            // 1. Verify OTP
            const otpRes = await fetch("/api/auth/otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "verify", email: pendingEmail, otp: otpCode }),
            });

            const otpData = await otpRes.json();

            if (!otpRes.ok) {
                setOtpError(otpData.message || "Invalid verification code.");
                setOtpValues(["", "", "", "", "", ""]);
                otpInputRefs.current[0]?.focus();
                setIsVerifying(false);
                return;
            }

            // 2. OTP Verified! Now complete the actual login/signup
            const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
            const payload = isLogin 
                ? { identifier: formData.identifier, password: formData.password, otpVerified: true }
                : { ...formData, otpVerified: true };

            const authRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const authData = await authRes.json();

            if (authRes.ok) {
                window.location.assign("/profile");
            } else {
                setOtpError(authData.message || "Authentication failed after verification.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            setOtpError("An unexpected error occurred. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        setOtpValues(["", "", "", "", "", ""]);
        setOtpError("");
        await sendOTP(pendingEmail);
        otpInputRefs.current[0]?.focus();
    };

    // Go back from OTP screen
    const handleOtpBack = () => {
        setOtpStep(false);
        setOtpValues(["", "", "", "", "", ""]);
        setOtpError("");
    };

    const isStudentSignup = !isLogin && formData.role === "student";
    const isProfessionalSignup = !isLogin && formData.role === "professional";

    // Mask email for display: jo***@gmail.com
    const getMaskedEmail = (email) => {
        if (!email) return "";
        const [local, domain] = email.split("@");
        if (!domain) return email;
        const visible = local.slice(0, Math.min(3, local.length));
        return `${visible}${"•".repeat(Math.max(0, local.length - 3))}@${domain}`;
    };

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">

                {/* ===== OTP VERIFICATION SCREEN ===== */}
                {otpStep ? (
                    <div className="otp-verification-screen fade-in">
                        <button className="otp-back-btn" onClick={handleOtpBack} type="button">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Back
                        </button>

                        <div className="otp-header">
                            <div className="otp-icon">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </svg>
                            </div>
                            <h2>Verify Your Email</h2>
                            <p>
                                We've sent a 6-digit verification code to<br/>
                                <strong>{getMaskedEmail(pendingEmail)}</strong>
                            </p>
                        </div>

                        <div className="otp-inputs-container">
                            {otpValues.map((val, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (otpInputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={val}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                                    className={`otp-input ${val ? "filled" : ""} ${otpError ? "error" : ""}`}
                                    disabled={isVerifying}
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>

                        {otpError && (
                            <div className="otp-error-msg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                {otpError}
                            </div>
                        )}

                        <button 
                            className="auth-btn otp-verify-btn"
                            onClick={() => {
                                const fullOtp = otpValues.join("");
                                if (fullOtp.length === 6) verifyOTPAndComplete(fullOtp);
                                else setOtpError("Please enter the complete 6-digit code");
                            }}
                            disabled={isVerifying || otpValues.join("").length < 6}
                        >
                            {isVerifying ? (
                                <span className="otp-spinner-wrap">
                                    <span className="otp-spinner"></span>
                                    Verifying...
                                </span>
                            ) : (
                                "Verify & Continue"
                            )}
                        </button>

                        <div className="otp-resend-section">
                            <p>Didn't receive the code?</p>
                            {otpTimer > 0 ? (
                                <span className="otp-timer">Resend in {otpTimer}s</span>
                            ) : (
                                <button 
                                    type="button" 
                                    className="otp-resend-btn" 
                                    onClick={handleResendOtp}
                                    disabled={isSendingOtp}
                                >
                                    {isSendingOtp ? "Sending..." : "Resend Code"}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ===== NORMAL AUTH FORM ===== */
                    <>
                        <div className="auth-header">
                            <h2>{isLogin ? "Welcome Back" : "Create an Account"}</h2>
                            <p>{isLogin ? "Sign in to view your bookings and profile." : "Join us to accelerate your MBA journey."}</p>
                        </div>

                        {errorMessage && <div className="auth-error">{errorMessage}</div>}

                        <form onSubmit={handleSubmit} className="auth-form" noValidate>

                            {/* ===== SIGNUP FIELDS ===== */}
                            {!isLogin && (
                                <>
                                    {/* 1. I am a... */}
                                    <div className="form-group">
                                        <label>I am a...</label>
                                        <select name="role" value={formData.role} onChange={handleInputChange} required>
                                            <option value="student">Student / Candidate</option>
                                            <option value="professional">Professional / Mentor</option>
                                        </select>
                                    </div>

                                    {/* 2. Full Name */}
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleInputChange} required />
                                        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                                    </div>

                                    {/* 3. Phone Number */}
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="e.g. +91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                                    </div>
                                </>
                            )}

                            {/* 4. Email (Signup) or Identifier (Login) */}
                            <div className="form-group">
                                <label>{isLogin ? "Email or Phone Number" : "Email Address"}</label>
                                <input
                                    type={isLogin ? "text" : "email"}
                                    name={isLogin ? "identifier" : "email"}
                                    placeholder={isLogin ? "Enter your email or phone" : "you@example.com"}
                                    value={isLogin ? formData.identifier : formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                                {isLogin ? (
                                    fieldErrors.identifier && <span className="field-error">{fieldErrors.identifier}</span>
                                ) : (
                                    fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>
                                )}
                            </div>

                            {/* Student-specific: 5. Qualification, 6. Area of Interest */}
                            {isStudentSignup && (
                                <>
                                    <div className="form-group">
                                        <label>Latest Qualification</label>
                                        <select name="latestQualification" value={formData.latestQualification} onChange={handleInputChange} required>
                                            <option value="" disabled>Select your qualification</option>
                                            <option value="High School">High School (12th)</option>
                                            <option value="Undergraduate">Undergraduate (B.A / B.Sc / B.Com / BBA)</option>
                                            <option value="Graduate">Graduate (B.Tech / B.E / Other)</option>
                                            <option value="Postgraduate">Postgraduate (M.A / M.Sc / M.Com / MBA)</option>
                                            <option value="Doctorate">Doctorate (Ph.D)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {fieldErrors.latestQualification && <span className="field-error">{fieldErrors.latestQualification}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Area of Interest</label>
                                        <select name="interest" value={formData.interest} onChange={handleInputChange} required>
                                            <option value="" disabled>Select your interest</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Human Resources">Human Resources</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Business Analytics">Business Analytics</option>
                                            <option value="Entrepreneurship">Entrepreneurship</option>
                                            <option value="Strategy & Consulting">Strategy & Consulting</option>
                                            <option value="Information Technology">Information Technology</option>
                                            <option value="General Management">General Management</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {fieldErrors.interest && <span className="field-error">{fieldErrors.interest}</span>}
                                    </div>
                                </>
                            )}

                            {/* Professional-specific: 5. Qualification, 6. Profession */}
                            {isProfessionalSignup && (
                                <>
                                    <div className="form-group">
                                        <label>Qualification</label>
                                        <select name="qualification" value={formData.qualification} onChange={handleInputChange} required>
                                            <option value="" disabled>Select your qualification</option>
                                            <option value="Undergraduate">Undergraduate (B.A / B.Sc / B.Com / BBA)</option>
                                            <option value="Graduate">Graduate (B.Tech / B.E / Other)</option>
                                            <option value="Postgraduate">Postgraduate (M.A / M.Sc / M.Com / MBA)</option>
                                            <option value="Doctorate">Doctorate (Ph.D)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {fieldErrors.qualification && <span className="field-error">{fieldErrors.qualification}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label>Profession</label>
                                        <select name="profession" value={formData.profession} onChange={handleInputChange} required>
                                            <option value="" disabled>Select your profession</option>
                                            <option value="Management Consultant">Management Consultant</option>
                                            <option value="Investment Banker">Investment Banker</option>
                                            <option value="Finance Manager">Finance Manager</option>
                                            <option value="Marketing Manager">Marketing Manager</option>
                                            <option value="Product Manager">Product Manager</option>
                                            <option value="Operations Manager">Operations Manager</option>
                                            <option value="HR Manager">HR Manager</option>
                                            <option value="Business Analyst">Business Analyst</option>
                                            <option value="Data Scientist">Data Scientist</option>
                                            <option value="Strategy Manager">Strategy Manager</option>
                                            <option value="Entrepreneur / Founder">Entrepreneur / Founder</option>
                                            <option value="General Manager">General Manager</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        {fieldErrors.profession && <span className="field-error">{fieldErrors.profession}</span>}
                                    </div>
                                </>
                            )}

                            {/* 7. Password */}
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder={isLogin ? "Enter your password" : "Create a strong password"} value={formData.password} onChange={handleInputChange} required />
                                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                            </div>



                            {/* 8. Confirm Password (signup only) */}
                            {!isLogin && (
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleInputChange} required />
                                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                                </div>
                            )}

                            {/* Passport Size Photo (signup only) */}
                            {!isLogin && (
                                <div className="form-group">
                                    <label>Passport Size Photo</label>
                                    <div className="photo-upload-area">
                                        {photoPreview ? (
                                            <div className="photo-preview">
                                                <img src={photoPreview} alt="Preview" />
                                                <button type="button" className="photo-remove-btn" onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, photo: "" })); }}>✕</button>
                                            </div>
                                        ) : (
                                            <label className="photo-upload-label" htmlFor="photo-input">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                                <span>Click to upload photo</span>
                                                <small>JPG, PNG — max 15MB</small>
                                            </label>
                                        )}
                                        <input type="file" id="photo-input" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                                    </div>
                                    {fieldErrors.photo && <span className="field-error">{fieldErrors.photo}</span>}
                                </div>
                            )}

                            {/* Professional Photo (professionals only) */}
                            {isProfessionalSignup && (
                                <div className="form-group">
                                    <label>
                                        Professional Photo
                                        <button type="button" className="example-link-btn" onClick={() => setShowExampleModal(true)}>
                                            See Example
                                        </button>
                                    </label>
                                    <div className="photo-upload-area">
                                        {profPhotoPreview ? (
                                            <div className="photo-preview">
                                                <img src={profPhotoPreview} alt="Professional Preview" />
                                                <button type="button" className="photo-remove-btn" onClick={() => { setProfPhotoPreview(null); setFormData(prev => ({ ...prev, professionalPhoto: "" })); }}>✕</button>
                                            </div>
                                        ) : (
                                            <label className="photo-upload-label" htmlFor="prof-photo-input">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                    <polyline points="21 15 16 10 5 21"></polyline>
                                                </svg>
                                                <span>Upload professional photo</span>
                                                <small>Formal headshot — max 15MB</small>
                                            </label>
                                        )}
                                        <input type="file" id="prof-photo-input" accept="image/*" onChange={handleProfPhotoChange} style={{ display: "none" }} />
                                    </div>
                                    {fieldErrors.professionalPhoto && <span className="field-error">{fieldErrors.professionalPhoto}</span>}
                                </div>
                            )}

                            <button type="submit" className="auth-btn" disabled={isSubmitting}>
                                {isSubmitting ? "Sending Code..." : isLogin ? "Sign In" : "Sign Up"}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button type="button" className="auth-toggle-btn" onClick={toggleMode}>
                                    {isLogin ? "Sign up here" : "Sign in here"}
                                </button>
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Example Professional Photo Modal */}
            {showExampleModal && (
                <div className="example-modal-overlay" onClick={() => setShowExampleModal(false)}>
                    <div className="example-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="example-modal-close" onClick={() => setShowExampleModal(false)}>✕</button>
                        <h3>Professional Photo Example</h3>
                        <div className="example-modal-image">
                            <img src="/professional-photo-example.png" alt="Professional photo example" />
                        </div>
                        <div className="example-modal-tips">
                            <p><strong>Tips for a great professional photo:</strong></p>
                            <ul>
                                <li>Wear formal / business attire</li>
                                <li>Use a plain, neutral background</li>
                                <li>Good, even lighting on your face</li>
                                <li>Shoulders-up framing</li>
                                <li>Look directly at the camera with a confident smile</li>
                            </ul>
                        </div>
                        <button className="example-modal-ok-btn" onClick={() => setShowExampleModal(false)}>Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
