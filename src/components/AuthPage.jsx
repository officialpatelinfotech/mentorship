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
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setErrorMessage("");
        setFormData({ name: "", email: "", password: "", role: "student" });
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
                // Redirect on success
                // Force a hard navigation to refresh server state (like Navbar)
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
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>I am a...</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} required>
                                    <option value="student">Student / Candidate</option>
                                    <option value="professional">Professional / Mentor</option>
                                    {/* Admin requires manual DB creation for security */}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
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
