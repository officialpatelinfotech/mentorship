"use client";
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminDashboard = ({ initialTab = "all" }) => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState('all');
    const [filterFeatured, setFilterFeatured] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [filterReason, setFilterReason] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState(initialTab); // "all", "mentors", "candidates", "manage-mentors"
    const [currentPage, setCurrentPage] = useState(1);
    const [mentorsPage, setMentorsPage] = useState(1);
    const [bookingsSort, setBookingsSort] = useState({ key: 'sessionDate', direction: 'desc' });
    const [mentorsSort, setMentorsSort] = useState({ key: 'name', direction: 'asc' });
    const ITEMS_PER_PAGE = 10;

    const handleSort = (key, sortState, setSortState) => {
        let direction = 'asc';
        if (sortState.key === key && sortState.direction === 'asc') {
            direction = 'desc';
        }
        setSortState({ key, direction });
    };

    const sortData = (data, sortConfig) => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            // Handling nullish values for robust sorting
            if (aVal == null && bVal != null) return 1;
            if (aVal != null && bVal == null) return -1;
            if (aVal == null && bVal == null) return 0;
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const renderSortIcon = (key, sortState) => {
        if (sortState.key !== key) return <span className="sort-icon"></span>;
        return <span className={`sort-icon ${sortState.direction}`}></span>;
    };

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
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

    const uniqueReasons = [...new Set(bookings.map(b => b.sessionReason).filter(Boolean))];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.mentorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const bookingDate = new Date(booking.sessionDate).toISOString().split('T')[0];
        const matchesDate = !filterDate || bookingDate === filterDate;
        
        const matchesReason = filterReason === 'all' || booking.sessionReason === filterReason;
        
        const d = new Date(booking.sessionDate);
        const timeParts = (booking.sessionTime || "").split(' ');
        if (timeParts.length === 2) {
            const [time, modifier] = timeParts;
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            d.setHours(hours, minutes, 0, 0);
        }
        const isUpcoming = d >= new Date();
        const status = isUpcoming ? 'upcoming' : 'completed';
        const matchesStatus = filterStatus === 'all' || status === filterStatus;

        return matchesSearch && matchesDate && matchesReason && matchesStatus;
    });

    const indexOfLastBooking = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstBooking = indexOfLastBooking - ITEMS_PER_PAGE;
    const sortedBookings = sortData(filteredBookings, bookingsSort);
    const currentBookings = sortedBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const uniqueRoles = [...new Set(allMentors.map(m => m.title).filter(Boolean))];

    const filteredMentors = allMentors.filter(m => {
        const matchesSearch = 
            m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.title?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || m.title === filterRole;
        
        const matchesFeatured = filterFeatured === 'all' || 
                               (filterFeatured === 'featured' && m.featured) || 
                               (filterFeatured === 'not-featured' && !m.featured);
                               
        return matchesSearch && matchesRole && matchesFeatured;
    });
    const indexOfLastMentor = mentorsPage * ITEMS_PER_PAGE;
    const indexOfFirstMentor = indexOfLastMentor - ITEMS_PER_PAGE;
    const totalMentorPages = Math.ceil(filteredMentors.length / ITEMS_PER_PAGE);
    const paginateMentors = (pageNumber) => setMentorsPage(pageNumber);

    const sortedMentors = sortData(filteredMentors, mentorsSort);
    const currentMentors = sortedMentors.slice(indexOfFirstMentor, indexOfLastMentor);

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
                                const d = new Date(b.sessionDate);
                                const timeParts = (b.sessionTime || "").split(' ');
                                if (timeParts.length === 2) {
                                    const [time, modifier] = timeParts;
                                    let [hours, minutes] = time.split(':').map(Number);
                                    if (modifier === 'PM' && hours < 12) hours += 12;
                                    if (modifier === 'AM' && hours === 12) hours = 0;
                                    d.setHours(hours, minutes, 0, 0);
                                }
                                const isUpcoming = d >= new Date();
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
            <div className="admin-main-header">
                <h1 className="admin-main-title">{activeTab === 'manage-mentors' ? 'Manage Mentors' : 'All Bookings'}</h1>
                <div className="admin-controls-wrapper">
                    <div className="admin-controls">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); setMentorsPage(1); }}
                            className="admin-search-input"
                        />
                    </div>
                    {activeTab !== 'manage-mentors' && (
                        <div className="admin-filters">
                            <input 
                                type="date" 
                                value={filterDate} 
                                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                                className="admin-filter-select"
                            />
                            <select 
                                value={filterReason} 
                                onChange={(e) => { setFilterReason(e.target.value); setCurrentPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="all">All Reasons</option>
                                {uniqueReasons.map(reason => (
                                    <option key={reason} value={reason}>{reason}</option>
                                ))}
                            </select>
                            <select 
                                value={filterStatus} 
                                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}
                    {activeTab === 'manage-mentors' && (
                        <div className="admin-filters">
                            <select 
                                value={filterRole} 
                                onChange={(e) => { setFilterRole(e.target.value); setMentorsPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="all">All Roles</option>
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <select 
                                value={filterFeatured} 
                                onChange={(e) => { setFilterFeatured(e.target.value); setMentorsPage(1); }}
                                className="admin-filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="featured">Featured Only</option>
                                <option value="not-featured">Not Featured</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>



            {message.text && (
                <div className={`admin-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {activeTab !== 'manage-mentors' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="sortable-th" onClick={() => handleSort('sessionDate', bookingsSort, setBookingsSort)}>Date &amp; Time {renderSortIcon('sessionDate', bookingsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('candidateName', bookingsSort, setBookingsSort)}>Student {renderSortIcon('candidateName', bookingsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('mentorName', bookingsSort, setBookingsSort)}>Mentor {renderSortIcon('mentorName', bookingsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('sessionReason', bookingsSort, setBookingsSort)}>Reason {renderSortIcon('sessionReason', bookingsSort)}</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBookings.length > 0 ? (
                                currentBookings.map((booking) => {
                                    const d = new Date(booking.sessionDate);
                                    const timeParts = (booking.sessionTime || "").split(' ');
                                    if (timeParts.length === 2) {
                                        const [time, modifier] = timeParts;
                                        let [hours, minutes] = time.split(':').map(Number);
                                        if (modifier === 'PM' && hours < 12) hours += 12;
                                        if (modifier === 'AM' && hours === 12) hours = 0;
                                        d.setHours(hours, minutes, 0, 0);
                                    }
                                    const isUpcoming = d >= new Date();
                                    return (
                                        <tr key={booking._id} className={isUpcoming ? 'row-upcoming' : 'row-past'}>
                                            <td data-label="Date &amp; Time">
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
            
            {activeTab !== 'manage-mentors' && filteredBookings.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => paginate(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button 
                        onClick={() => paginate(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}

            {activeTab === 'manage-mentors' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="sortable-th" onClick={() => handleSort('name', mentorsSort, setMentorsSort)}>Mentor {renderSortIcon('name', mentorsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('title', mentorsSort, setMentorsSort)}>Role/Title {renderSortIcon('title', mentorsSort)}</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMentors.map(mentor => {
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
                            {filteredMentors.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="empty-row">No mentors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'manage-mentors' && filteredMentors.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => paginateMentors(mentorsPage - 1)} 
                        disabled={mentorsPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {mentorsPage} of {totalMentorPages}
                    </span>
                    <button 
                        onClick={() => paginateMentors(mentorsPage + 1)} 
                        disabled={mentorsPage === totalMentorPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
