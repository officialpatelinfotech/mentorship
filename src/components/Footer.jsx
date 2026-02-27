import React from "react";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-main">
                <div className="footer-brand">
                    <h2 className="footer-logo">MBA <span>Mentorship</span></h2>
                    <p className="footer-tagline">Empowering your MBA journey</p>

                    <div className="footer-legal">
                        <p>&copy; {new Date().getFullYear()} MBA Mentorship. All rights reserved. <a href="#">Privacy policy</a>.</p>
                    </div>
                </div>

                <div className="footer-nav">
                    <div className="footer-nav-top">
                        <a href="/">Home</a>
                        <a href="/professionals">Professionals</a>
                        <a href="/about-us">About Us</a>
                        <a href="/contact-us">Contact Us</a>
                    </div>
                    <div className="footer-nav-list">
                        <a href="#">MBA Mentorship</a>
                        <a href="#">B-School Prep</a>
                        <a href="#">Career Guidance</a>
                        <a href="#">Premium Packages</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
