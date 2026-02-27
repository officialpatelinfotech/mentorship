"use client";
import React, { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <a href="/" className="navbar-logo">
                MBA <span className="logo-dot">Mentorship</span>
            </a>

            {/* Desktop links */}
            <div className="navbar-links">
                <a href="/" className="nav-link active">Home</a>
                <a href="/professionals" className="nav-link">Professionals</a>
                <a href="/about-us" className="nav-link">About Us</a>
                <a href="/contact-us" className="nav-link">Contact Us</a>
            </div>

            {/* Hamburger button */}
            <button
                className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            {/* Mobile overlay */}
            <div
                className={`mobile-overlay ${menuOpen ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
            ></div>

            {/* Mobile menu */}
            <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
                <a href="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</a>
                <a href="/professionals" className="mobile-link" onClick={() => setMenuOpen(false)}>Professionals</a>
                <a href="/about-us" className="mobile-link" onClick={() => setMenuOpen(false)}>About Us</a>
                <a href="/contact-us" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
            </div>
        </nav>
    );
};

export default Navbar;
