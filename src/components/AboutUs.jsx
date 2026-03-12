import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
    return (
        <div className="about-page">
            {/* Hero heading */}
            <section className="about-hero">
                <h1>About</h1>
                <p className="about-subtitle">Where a lifelong passion for education evolves into a new approach to mentorship.</p>
            </section>

            {/* Story split — text left, image right */}
            <section className="about-split">
                <div className="about-split-text">
                    <p>Our journey began with a simple question: why is quality MBA mentorship so hard to find? Every year, thousands of aspiring students navigate the complex world of B-school admissions alone — unsure of where to start, who to trust, or how to stand out.</p>
                    <p>We set out to change that. By bringing together a handpicked group of mentors from top business schools and leading companies, we created a platform that delivers real, actionable guidance — not generic advice. Every session is tailored, every mentor is vetted, and every student matters.</p>
                </div>
                <div className="about-split-image">
                    <img
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
                        alt="Team collaboration"
                    />
                </div>
            </section>

            {/* Mission split — image left, text right */}
            <section className="about-mission">
                <div className="about-mission-image">
                    <img
                        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                        alt="Our team"
                    />
                </div>
                <div className="about-mission-text">
                    <h2>This is where passion<br />meets purpose.</h2>
                    <p>Known for being meticulous and deeply invested in each student&apos;s success, our mentors don&apos;t just guide — they champion. Every interaction is designed to push you closer to your goals, whether that&apos;s cracking a top 10 MBA, acing your interviews, or pivoting your career with confidence.</p>
                    <p className="about-signature">
                        <strong>The Dishanta Team</strong><br />
                        Founders, Dishanta
                    </p>
                </div>
            </section>

            {/* New section based on the provided edit */}
            <section className="about-content">
                <div className="about-text">
                    <h2>Our Mission</h2>
                    <p>At <strong>Dishanta</strong>, we believe that everyone deserves access to top-tier mentorship. Our mission is to bridge the gap between aspiring MBA candidates and successful professionals from the world's leading business schools.</p>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="about-cta">
                <img
                    className="about-cta-bg"
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
                    alt=""
                />
                <div className="about-cta-overlay"></div>
                <div className="about-cta-content">
                    <h2>Ready to accelerate<br />your MBA journey?</h2>
                    <p>Connect with top mentors and get real guidance, real insights, and real results.</p>
                    <div className="about-cta-buttons">
                        <a href="/professionals" className="about-btn about-btn-primary">Explore Mentors</a>
                        <a href="/contact-us" className="about-btn about-btn-secondary">Contact Us</a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
