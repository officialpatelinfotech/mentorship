"use client";
import React, { useState } from "react";
import "./Navbar.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/';
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <nav className="navbar">
            <a href="/" className="navbar-logo">
                Dishanta
            </a>

            {/* Desktop links */}
            <div className="navbar-links">
                <a href="/" className="nav-link">Home</a>
                <a href="/professionals" className="nav-link">Professionals</a>
                <a href="/about-us" className="nav-link">About Us</a>
                <a href="/contact-us" className="nav-link">Contact Us</a>
                {user ? (
                    <div className="profile-dropdown-container" ref={dropdownRef}>
                        <button
                            className="profile-avatar-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            {user.photo ? (
                                <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar-large">
                                        {user.photo ? (
                                            <img src={user.photo} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <div className="dropdown-user-info">
                                        <h4>{user.name}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-links">
                                    <a href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        User Profile
                                    </a>

                                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <a href="/auth" className="nav-link login-icon-link" title="Login">
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                )}
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
                <button
                    className="mobile-close-btn"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <a href="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</a>
                <a href="/professionals" className="mobile-link" onClick={() => setMenuOpen(false)}>Professionals</a>
                <a href="/about-us" className="mobile-link" onClick={() => setMenuOpen(false)}>About Us</a>
                <a href="/contact-us" className="mobile-link" onClick={() => setMenuOpen(false)}>Contact Us</a>
                {user ? (
                    <>
                        <a href="/profile" className="mobile-link profile-link" onClick={() => setMenuOpen(false)}>My Profile</a>

                        <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="mobile-link" style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', color: 'var(--text-muted)' }}>Logout</button>
                    </>
                ) : (
                    <a href="/auth" className="mobile-link login-link" onClick={() => setMenuOpen(false)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Login
                    </a>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
