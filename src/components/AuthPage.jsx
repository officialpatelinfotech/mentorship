"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./AuthPage.css";

const AuthPage = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        phone: "",
        latestQualification: "",
        interest: "",
        qualification: "",
        profession: "",
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMessage("");
        setFormData({ name: "", email: "", password: "", role: "student", phone: "", latestQualification: "", interest: "", qualification: "", profession: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData),
            });

            const data = await res.json();

            if (res.ok) {
                window.location.assign("/profile");
            } else {
                setErrorMessage(data.message || "Authentication failed.");
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isStudentSignup = !isLogin && formData.role === "student";
    const isProfessionalSignup = !isLogin && formData.role === "professional";

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">
                <div className="auth-header">
                    <h2>{isLogin ? "Welcome Back" : "Create an Account"}</h2>
                    <p>{isLogin ? "Sign in to view your bookings and profile." : "Join us to accelerate your MBA journey."}</p>
                </div>

                {errorMessage && <div className="auth-error">{errorMessage}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>I am a...</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} required>
                                    <option value="student">Student / Candidate</option>
                                    <option value="professional">Professional / Mentor</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Student-specific fields */}
                    {isStudentSignup && (
                        <>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                            </div>
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
                            </div>
                        </>
                    )}

                    {/* Professional-specific fields */}
                    {isProfessionalSignup && (
                        <>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" placeholder="e.g. +91 98765 43210" value={formData.phone} onChange={handleInputChange} required />
                            </div>
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
                            </div>
                            <div className="form-group">
                                <label>Profession</label>
                                <input type="text" name="profession" placeholder="e.g. Management Consultant, Finance Manager" value={formData.profession} onChange={handleInputChange} required />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleInputChange} required />
                    </div>

                    <button type="submit" className="auth-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
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
            </div>
        </div>
    );
};

export default AuthPage;
