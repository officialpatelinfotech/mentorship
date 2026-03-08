"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Profile.css";
import SlotManager from "./SlotManager";

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '' });
    const [editStatus, setEditStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch User
                const userRes = await fetch('/api/auth/me');
                const userData = await userRes.json();

                if (!userData.success || !userData.user) {
                    window.location.href = '/auth';
                    return;
                }
                setUser(userData.user);

                // Fetch User's Bookings
                const bookingsRes = await fetch(`/api/bookings?role=${userData.user.role}&email=${encodeURIComponent(userData.user.email)}`);
                const bookingsData = await bookingsRes.json();
                if (bookingsData.success) {
                    setBookings(bookingsData.data || []);
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
                window.location.href = '/auth';
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/auth'; // Hard navigate to clear state fully
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const startEditing = () => {
        setEditData({ name: user.name, email: user.email });
        setEditStatus({ type: '', message: '' });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditStatus({ type: '', message: '' });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setEditStatus({ type: '', message: '' });

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const data = await res.json();

            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                setEditStatus({ type: 'success', message: 'Profile updated!' });
                setTimeout(() => setEditStatus({ type: '', message: '' }), 3000);
            } else {
                setEditStatus({ type: 'error', message: data.message || 'Update failed' });
            }
        } catch (error) {
            setEditStatus({ type: 'error', message: 'An error occurred' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="profile-loading">Loading your dashboard...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="profile-page">
            <div className="profile-container fade-in">

                {/* Header Section */}
                <div className="profile-header">
                    <div className="profile-info">
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="edit-profile-form">
                                <div className="edit-form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="edit-form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                {editStatus.message && (
                                    <p className={`edit-status ${editStatus.type}`}>{editStatus.message}</p>
                                )}
                                <div className="edit-form-actions">
                                    <button type="submit" className="save-btn" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={cancelEditing}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h2>Welcome, {user.name}</h2>
                                <p>{user.email}</p>
                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                {user.role === 'professional' && user.mentorId && (
                                    <p className="mentor-id-text">Mentor ID: <strong>{user.mentorId}</strong></p>
                                )}
                                {editStatus.type === 'success' && (
                                    <p className="edit-status success">{editStatus.message}</p>
                                )}
                            </>
                        )}
                    </div>
                    <div className="header-actions">
                        {!isEditing && (
                            <button className="edit-btn" onClick={startEditing} title="Edit Profile">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                            </button>
                        )}
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="profile-stats">
                    <div className="stat-card">
                        <h3>Total Bookings</h3>
                        <p className="stat-value">{bookings.length}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Upcoming</h3>
                        <p className="stat-value">
                            {bookings.filter(b => new Date(b.sessionDate) >= new Date()).length}
                        </p>
                    </div>
                </div>

                {/* Tab Navigation for Professionals */}
                {user.role === 'professional' && (
                    <div className="profile-tabs">
                        <button
                            className={`profile-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('bookings')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Booked Sessions
                        </button>
                        <button
                            className={`profile-tab ${activeTab === 'availability' ? 'active' : ''}`}
                            onClick={() => setActiveTab('availability')}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            Manage Availability
                        </button>
                    </div>
                )}

                {/* Booked Sessions Tab / Default for Students */}
                {(user.role === 'student' || activeTab === 'bookings') && (
                    <div className="profile-bookings">
                        <h3>Your Sessions</h3>

                        {bookings.length === 0 ? (
                            <div className="no-bookings">
                                <p>You {"don't"} have any bookings yet.</p>
                                {user.role === 'student' && (
                                    <a href="/professionals" className="profile-cta-btn">Book a Mentor Now</a>
                                )}
                            </div>
                        ) : (
                            <div className="bookings-grid">
                                {bookings.map((booking) => {
                                    const isUpcoming = new Date(booking.sessionDate) >= new Date();
                                    return (
                                        <div key={booking._id} className={`booking-card ${isUpcoming ? 'upcoming' : 'past'}`}>
                                            <div className="booking-card-header">
                                                <span className={`status-badge ${isUpcoming ? 'upcoming' : 'past'}`}>
                                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                                </span>
                                                <span className="booking-date">
                                                    {new Date(booking.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="booking-card-body">
                                                <h4 className="booking-reason">{booking.sessionReason}</h4>

                                                {user.role === 'student' ? (
                                                    <p className="booking-person"><strong>Mentor:</strong> {booking.mentorName}</p>
                                                ) : (
                                                    <p className="booking-person"><strong>Candidate:</strong> {booking.candidateName} <br /><small>({booking.email})</small></p>
                                                )}

                                                <div className="booking-details">
                                                    <div className="detail-item">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                        {booking.sessionTime}
                                                    </div>
                                                    {user.role === 'professional' && (
                                                        <div className="detail-item">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                            {booking.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Manage Availability Tab — Professionals only */}
                {user.role === 'professional' && activeTab === 'availability' && user.mentorId && (
                    <div className="profile-bookings">
                        <SlotManager mentorId={user.mentorId} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default Profile;
