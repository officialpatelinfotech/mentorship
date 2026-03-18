"use client";
import React from "react";
import "./ProfileSidebar.css";

const ProfileSidebar = ({ user, activeSection, onSectionChange, onLogout }) => {
    const navItems = [
        {
            key: "dashboard", label: "Dashboard", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                </svg>
            )
        },
        {
            key: "bookings", label: user?.role === "admin" ? "All Bookings" : "Bookings", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        ...(user?.role === "admin" ? [{
            key: "analytics", label: "Analytics", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            )
        }] : []),
        ...(user?.role === "admin" ? [{
            key: "manage-mentors", label: "Manage Mentors", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        }] : []),
        ...(user?.role === "professional" ? [{
            key: "slots", label: "Slots", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            )
        }] : []),
        {
            key: "profile", label: "Profile", icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
    ];

    return (
        <aside className="profile-sidebar">
            {/* User brief */}
            <div className="sidebar-user-brief">
                <div className="sidebar-avatar">
                    {user?.photo ? (
                        <img src={user.photo} alt={user.name} className="sidebar-avatar-img" />
                    ) : (
                        user?.name ? user.name.charAt(0).toUpperCase() : "U"
                    )}
                </div>
                <div className="sidebar-user-info">
                    <h4>{user?.name}</h4>
                    <span className={`sidebar-role ${user?.role}`}>{user?.role}</span>
                </div>
            </div>

            <div className="sidebar-divider"></div>

            {/* Navigation items */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        className={`sidebar-nav-item ${activeSection === item.key ? "active" : ""}`}
                        onClick={() => onSectionChange(item.key)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}

                <div className="sidebar-divider"></div>

                <button className="sidebar-nav-item logout-nav-item" onClick={onLogout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Logout</span>
                </button>
            </nav>
        </aside>
    );
};

export default ProfileSidebar;
