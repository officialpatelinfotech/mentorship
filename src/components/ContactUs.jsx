"use client";
import React, { useState, useEffect } from "react";
import "./ContactUs.css";

const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
    });
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill user data if logged in
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.success && data.user) {
                    const nameParts = data.user.name ? data.user.name.split(' ') : ['', ''];
                    setFormData(prev => ({
                        ...prev,
                        firstName: nameParts[0] || "",
                        lastName: nameParts.slice(1).join(' ') || "",
                        email: data.user.email || prev.email,
                        phone: data.user.phone || prev.phone
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch user data for contact form", err);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: "", message: "" });

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    subject: "General Inquiry"
                }),
            });

            const data = await res.json();

            if (data.success) {
                setStatus({ type: "success", message: "Thank you! Your message has been sent." });
                setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
            } else {
                setStatus({ type: "error", message: data.message || "Something went wrong. Please try again." });
            }
        } catch (error) {
            setStatus({ type: "error", message: "Failed to connect to the server." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Hero heading */}
            <section className="contact-hero">
                <h1>Contact</h1>
            </section>

            {/* Image + Text split */}
            <section className="contact-intro">
                <div className="contact-intro-image">
                    <img
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                        alt="Mentorship session"
                    />
                </div>
                <div className="contact-intro-text">
                    <p>Got a question about our programs or want help choosing the right mentor? Email us or use the inquiry form below and we&apos;ll get back to you.</p>
                    <p className="contact-email">contact@patelinfotech.online</p>
                </div>
            </section>

            {/* Inquiry Form */}
            <section className="contact-form-section">
                <h2>Inquiry Form</h2>
                <form className="inquiry-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            Name <span className="required">*</span>
                        </label>
                        <div className="name-fields">
                            <div className="name-field">
                                <span className="field-hint">First</span>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="name-field">
                                <span className="field-hint">Last</span>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Phone <span className="required">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Message <span className="required">*</span>
                        </label>
                        <textarea
                            name="message"
                            rows="6"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    {status.message && (
                        <div className={`form-status ${status.type}`}>
                            {status.message}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Submit"}
                    </button>
                </form>
            </section>

            {/* CTA Banner */}
            <section className="contact-cta">
                <img
                    className="contact-cta-bg"
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
                    alt=""
                />
                <div className="contact-cta-overlay"></div>
                <div className="contact-cta-content">
                    <h2>Ready to accelerate<br />your MBA journey?</h2>
                    <p>Connect with top mentors and get real guidance, real insights, and real results.</p>
                    <div className="contact-cta-buttons">
                        <a href="/professionals" className="cta-btn-w cta-btn-w-primary">Explore Mentors</a>
                        <a href="/contact-us" className="cta-btn-w cta-btn-w-secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
