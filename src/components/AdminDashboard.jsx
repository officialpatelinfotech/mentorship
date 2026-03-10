"use client";
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // "all", "mentors", "candidates", "manage-mentors"
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [allMentors, setAllMentors] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchAllBookings = async () => {
            try {
                const res = await fetch('/api/admin/bookings');
                const data = await res.json();

                if (data.success) {
                    setBookings(data.data || []);
                } else {
                    setError(data.message || "Failed to fetch bookings");
                }
            } catch (err) {
                console.error("Admin fetch error:", err);
                setError("An error occurred while loading bookings.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllBookings();
    }, []);

    useEffect(() => {
        if (activeTab === 'manage-mentors') {
            fetchMentors();
        }
    }, [activeTab]);

    const fetchMentors = async () => {
        try {
            const res = await fetch('/api/admin/mentors');
            const data = await res.json();
            if (data.success) {
                setAllMentors(data.data || []);
            }
        } catch (err) {
            console.error("Fetch mentors error:", err);
        }
    };

    const toggleFeature = async (mentorId, currentStatus, type) => {
        setIsUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/admin/mentors/feature', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mentorId, isFeatured: !currentStatus, type })
            });
            const data = await res.json();
            if (data.success) {
                setAllMentors(prev => prev.map(m =>
                    m._id === mentorId ? { ...m, isFeatured: !currentStatus } : m
                ));
                setMessage({ type: 'success', text: 'Status updated!' });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update status' });
        } finally {
            setIsUpdating(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    // Statistics Aggregations
    const mentorStats = Object.values(bookings.reduce((acc, b) => {
        if (!acc[b.mentorId]) {
            acc[b.mentorId] = { mentorId: b.mentorId, mentorName: b.mentorName, count: 0 };
        }
        acc[b.mentorId].count++;
        return acc;
    }, {}));

    const candidateStats = Object.values(bookings.reduce((acc, b) => {
        const key = b.email || b.candidateName;
        if (!acc[key]) {
            acc[key] = { candidateName: b.candidateName, email: b.email, count: 0, qualification: b.qualification };
        }
        acc[key].count++;
        return acc;
    }, {}));

    const handleMentorClick = (mentorId) => {
        const mentorInfo = bookings.find(b => b.mentorId === mentorId);
        const mentorBookings = bookings.filter(b => b.mentorId === mentorId);
        setSelectedMentor({
            id: mentorId,
            name: mentorInfo?.mentorName || "Unknown Mentor",
            bookings: mentorBookings
        });
    };

    const filteredBookings = bookings.filter(booking =>
        booking.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.mentorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="admin-loading">Loading Admin Dashboard...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    // --- Detail View Render ---
    if (selectedMentor) {
        return (
            <div className="admin-dashboard">
                <div className="admin-header">
                    <button className="back-btn" onClick={() => setSelectedMentor(null)} title="Back to Dashboard">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <h1>Sessions for {selectedMentor.name}</h1>
                </div>

                <div className="admin-stats-summary">
                    Total Sessions: <strong>{selectedMentor.bookings.length}</strong>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Candidate</th>
                                <th>Email</th>
                                <th>Reason</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedMentor.bookings.map(b => {
                                const isUpcoming = new Date(b.sessionDate) >= new Date();
                                return (
                                    <tr key={b._id}>
                                        <td data-label="Date & Time">{new Date(b.sessionDate).toLocaleDateString()} at {b.sessionTime}</td>
                                        <td data-label="Candidate">{b.candidateName}</td>
                                        <td data-label="Email">{b.email}</td>
                                        <td data-label="Reason">{b.sessionReason}</td>
                                        <td data-label="Status">
                                            <span className={`admin-status-badge ${isUpcoming ? 'upcoming' : 'completed'}`}>
                                                {isUpcoming ? 'Upcoming' : 'Completed'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="admin-controls">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                    />
                </div>
            </div>

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Bookings
                </button>
                <button
                    className={`admin-tab ${activeTab === 'mentors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mentors')}
                >
                    Mentor Stats
                </button>
                <button
                    className={`admin-tab ${activeTab === 'candidates' ? 'active' : ''}`}
                    onClick={() => setActiveTab('candidates')}
                >
                    Candidate Stats
                </button>
                <button
                    className={`admin-tab ${activeTab === 'manage-mentors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage-mentors')}
                >
                    Manage Mentors
                </button>
            </div>

            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'all' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Student</th>
                                <th>Mentor</th>
                                <th>Reason</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length > 0 ? (
                                filteredBookings.map((booking) => {
                                    const isUpcoming = new Date(booking.sessionDate) >= new Date();
                                    return (
                                        <tr key={booking._id} className={isUpcoming ? 'row-upcoming' : 'row-past'}>
                                            <td data-label="Date & Time">
                                                <div className="date-cell">
                                                    <span className="date-text">{new Date(booking.sessionDate).toLocaleDateString()}</span>
                                                    <span className="time-text">{booking.sessionTime}</span>
                                                </div>
                                            </td>
                                            <td data-label="Student">
                                                <div className="user-cell">
                                                    <strong>{booking.candidateName}</strong>
                                                    <span>{booking.email}</span>
                                                </div>
                                            </td>
                                            <td data-label="Mentor">
                                                <div className="mentor-cell clickable" onClick={() => handleMentorClick(booking.mentorId)}>
                                                    <strong>{booking.mentorName}</strong>
                                                    <small>View Details &rarr;</small>
                                                </div>
                                            </td>
                                            <td data-label="Reason">{booking.sessionReason}</td>
                                            <td data-label="Status">
                                                <span className={`admin-status-badge ${isUpcoming ? 'upcoming' : 'completed'}`}>
                                                    {isUpcoming ? 'Upcoming' : 'Completed'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="5" className="empty-row">No bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'mentors' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mentor Name</th>
                                <th>Mentor ID</th>
                                <th>Total Sessions</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mentorStats.map(stat => (
                                <tr key={stat.mentorId}>
                                    <td><strong>{stat.mentorName}</strong></td>
                                    <td>{stat.mentorId}</td>
                                    <td>{stat.count}</td>
                                    <td>
                                        <button className="view-detail-btn" onClick={() => handleMentorClick(stat.mentorId)}>
                                            View Sessions
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'candidates' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Email</th>
                                <th>Qualification</th>
                                <th>Total Sessions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidateStats.map(stat => (
                                <tr key={stat.email}>
                                    <td data-label="Candidate"><strong>{stat.candidateName}</strong></td>
                                    <td data-label="Email">{stat.email}</td>
                                    <td data-label="Qualification">{stat.qualification}</td>
                                    <td data-label="Sessions">{stat.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'manage-mentors' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Mentor</th>
                                <th>Role/Title</th>
                                <th>Featured</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMentors
                                .filter(m =>
                                    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    m.title?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(mentor => {
                                    const isSeeded = !mentor.email;
                                    return (
                                        <tr key={mentor._id}>
                                            <td data-label="Mentor">
                                                <div className="user-cell">
                                                    <strong>{mentor.name}</strong>
                                                    <span>{mentor.email || mentor.mentorId}</span>
                                                </div>
                                            </td>
                                            <td data-label="Role/Title">{mentor.title}</td>
                                            <td data-label="Status">
                                                <span className={`admin-status-badge ${mentor.isFeatured ? 'upcoming' : 'completed'}`}>
                                                    {mentor.isFeatured ? 'Featured' : 'Regular'}
                                                </span>
                                            </td>
                                            <td data-label="Action">
                                                <button
                                                    className={`feature-toggle-btn ${mentor.isFeatured ? 'remove' : 'add'}`}
                                                    onClick={() => toggleFeature(mentor._id, mentor.isFeatured, isSeeded ? 'seeded' : 'user')}
                                                    disabled={isUpdating}
                                                >
                                                    {mentor.isFeatured ? 'Remove' : 'Feature'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            {allMentors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-row">No mentors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
