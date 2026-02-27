import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
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
                    <p className="contact-email">contact@mbamentorship.com</p>
                </div>
            </section>

            {/* Inquiry Form */}
            <section className="contact-form-section">
                <h2>Inquiry Form</h2>
                <form className="inquiry-form">
                    <div className="form-group">
                        <label className="form-label">
                            Name <span className="required">*</span>
                        </label>
                        <div className="name-fields">
                            <div className="name-field">
                                <span className="field-hint">First</span>
                                <input type="text" required />
                            </div>
                            <div className="name-field">
                                <span className="field-hint">Last</span>
                                <input type="text" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Email <span className="required">*</span>
                        </label>
                        <input type="email" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Phone <span className="required">*</span>
                        </label>
                        <input type="tel" required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Message <span className="required">*</span>
                        </label>
                        <textarea rows="6" required></textarea>
                    </div>

                    <button type="submit" className="submit-btn">Submit</button>
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
