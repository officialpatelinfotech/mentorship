"use client";
import React from "react";
import "./PersonalizedGuidance.css";

const PersonalizedGuidance = () => {
    return (
        <div className="guidance-page">
            {/* Hero Section */}
            <section className="guidance-hero">
                <div className="guidance-hero-content">
                    <h1>Personalized Guidance</h1>
                    <p>Every journey is unique. We build tailored strategies mapping every step of your MBA application and interview process.</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="guidance-content">
                <div className="guidance-grid">
                    <div className="guidance-text">
                        <h2>Your bespoke roadmap to top B-Schools.</h2>
                        <p>
                            Generic advice doesn&apos;t cut it when you are aiming for top-tier institutions. Our mentors work closely with you to understand your background, your distinct career aspirations, and your unique personality.
                        </p>
                        <p>
                            We then deconstruct the admission process into actionable milestones: from crafting compelling essays and refining resumes, to conducting rigorous mock interviews. You get honest feedback, insider perspectives, and unwavering support.
                        </p>

                        <div className="guidance-features">
                            <div className="guidance-feature">
                                <h3>1-on-1 Strategy Calls</h3>
                                <p>Deep dive sessions to structure your profile, select target schools, and define your narrative.</p>
                            </div>
                            <div className="guidance-feature">
                                <h3>Essay & Resume Reviews</h3>
                                <p>Unlimited iterations fine-tuning your written applications to ensure your story stands out.</p>
                            </div>
                            <div className="guidance-feature">
                                <h3>Mock Interviews</h3>
                                <p>Simulated admissions interviews with former AdCom members and recent alumni.</p>
                            </div>
                        </div>
                    </div>

                    <div className="guidance-image">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" alt="Mentor giving personalized guidance" />
                        <div className="guidance-image-bg"></div>
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="guidance-cta">
                <img
                    className="guidance-cta-bg"
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
                    alt=""
                />
                <div className="guidance-cta-overlay"></div>
                <div className="guidance-cta-content">
                    <h2>Ready to accelerate<br />your MBA journey?</h2>
                    <p>Connect with top mentors and get real guidance, real insights, and real results.</p>
                    <div className="guidance-cta-buttons">
                        <a href="/professionals" className="guidance-btn guidance-btn-primary">Explore Mentors</a>
                        <a href="/contact-us" className="guidance-btn guidance-btn-secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PersonalizedGuidance;
