"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "./Profile.css";
import SlotManager from "./SlotManager";
import ProfileSidebar from "./ProfileSidebar";
import AdminDashboard from "./AdminDashboard";
import AdminAnalytics from "./AdminAnalytics";
import { compressImage } from "@/lib/imageUtils";

const Profile = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: '', email: '', photo: '', phone: '', qualification: '', latestQualification: '', profession: '', interest: '', professionalPhoto: '' });
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);
    const [editProfPhotoPreview, setEditProfPhotoPreview] = useState(null);
    const [editStatus, setEditStatus] = useState({ type: '', message: '' });
    const [activeSection, setActiveSection] = useState(tabParam || 'dashboard');
    const [isSaving, setIsSaving] = useState(false);

    // Pagination state for bookings
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Filter states for bookings
    const [filterName, setFilterName] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterTime, setFilterTime] = useState('');

    // Update URL when section changes
    useEffect(() => {
        if (activeSection !== 'dashboard') {
            router.replace(`/profile?tab=${activeSection}`, { scroll: false });
        } else {
            router.replace(`/profile`, { scroll: false });
        }
        // Reset pagination and filters when switching tabs
        setCurrentPage(1);
        setFilterName('');
        setFilterEmail('');
        setFilterDate('');
        setFilterTime('');
    }, [activeSection, router]);

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
            window.location.href = '/auth';
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const startEditing = () => {
        setEditData({
            name: user.name || '',
            email: user.email || '',
            photo: user.photo || '',
            phone: user.phone || '',
            qualification: user.qualification || '',
            latestQualification: user.latestQualification || '',
            profession: user.profession || '',
            interest: user.interest || '',
            professionalPhoto: user.professionalPhoto || ''
        });
        setEditPhotoPreview(user.photo || null);
        setEditProfPhotoPreview(user.professionalPhoto || null);
        setEditStatus({ type: '', message: '' });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditPhotoPreview(null);
        setEditProfPhotoPreview(null);
        setEditStatus({ type: '', message: '' });
    };

    const handleEditProfPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            setEditStatus({ type: 'error', message: 'Professional Photo must be less than 15MB' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressed = await compressImage(reader.result);
                setEditData(prev => ({ ...prev, professionalPhoto: compressed }));
                setEditProfPhotoPreview(compressed);
            } catch (err) {
                console.error("Compression error:", err);
                setEditStatus({ type: 'error', message: 'Failed to process image' });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleEditPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            setEditStatus({ type: 'error', message: 'Photo must be less than 15MB' });
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressed = await compressImage(reader.result);
                setEditData(prev => ({ ...prev, photo: compressed }));
                setEditPhotoPreview(compressed);
            } catch (err) {
                console.error("Compression error:", err);
                setEditStatus({ type: 'error', message: 'Failed to process image' });
            }
        };
        reader.readAsDataURL(file);
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
        return <div className="profile-loading"></div>;
    }

    if (!user) {
        return null;
    }

    // --- Section Renderers ---

    const renderDashboard = () => (
        <>
            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-info">
                    <h2>Welcome, {user.name}</h2>
                    <p>{user.email}</p>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                    {user.role === 'professional' && user.mentorId && (
                        <p className="mentor-id-text">Mentor ID: <strong>{user.mentorId}</strong></p>
                    )}
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
                        {bookings.filter(b => {
                            const bookingDateTimeString = `${b.sessionDate?.split('T')[0]} ${b.sessionTime}`;
                            return new Date(bookingDateTimeString) >= new Date();
                        }).length}
                    </p>
                </div>
            </div>
        </>
    );

    const renderBookings = () => {
        if (user.role === 'admin') {
            return <AdminDashboard initialTab={activeSection === 'manage-mentors' ? 'manage-mentors' : 'all'} />;
        }

        // Apply Filters
        const filteredBookings = bookings.filter((booking) => {
            const matchName = user.role === 'student' 
                ? booking.mentorName?.toLowerCase().includes(filterName.toLowerCase())
                : booking.candidateName?.toLowerCase().includes(filterName.toLowerCase());
            
            const matchEmail = booking.email?.toLowerCase().includes(filterEmail.toLowerCase());
            const matchDate = filterDate ? booking.sessionDate?.startsWith(filterDate) : true;
            const matchTime = filterTime ? booking.sessionTime?.includes(filterTime) : true;

            return (!filterName || matchName) && (!filterEmail || matchEmail) && matchDate && matchTime;
        });

        // Pagination calculations on filtered list
        const indexOfLastBooking = currentPage * ITEMS_PER_PAGE;
        const indexOfFirstBooking = indexOfLastBooking - ITEMS_PER_PAGE;
        const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
        const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

        // Get unique options for filters
        const uniqueNames = [...new Set(bookings.map(b => user.role === 'student' ? b.mentorName : b.candidateName).filter(Boolean))].sort();
        const uniqueEmails = [...new Set(bookings.map(b => b.email).filter(Boolean))].sort();
        const uniqueDates = [...new Set(bookings.map(b => b.sessionDate?.split('T')[0]).filter(Boolean))].sort((a, b) => new Date(b) - new Date(a));
        const uniqueTimes = [...new Set(bookings.map(b => b.sessionTime).filter(Boolean))].sort();

        return (
            <div className="profile-bookings">
                <h3>Your Bookings</h3>

                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <p>You {"don't"} have any bookings yet.</p>
                        {user.role === 'student' && (
                            <a href="/professionals" className="profile-cta-btn">Book a Mentor Now</a>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Filters UI */}
                        <div className="bookings-filters">
                            <input 
                                type="text"
                                list="name-options"
                                placeholder={user.role === 'student' ? "Filter by Mentor Name" : "Filter by Candidate Name"}
                                value={filterName}
                                onChange={(e) => { setFilterName(e.target.value); setCurrentPage(1); }}
                                className="filter-input-text"
                            />
                            <datalist id="name-options">
                                {uniqueNames.map(name => (
                                    <option key={name} value={name} />
                                ))}
                            </datalist>

                            {user.role === 'professional' && (
                                <>
                                    <input 
                                        type="text"
                                        list="email-options"
                                        placeholder="Filter by Email"
                                        value={filterEmail}
                                        onChange={(e) => { setFilterEmail(e.target.value); setCurrentPage(1); }}
                                        className="filter-input-text"
                                    />
                                    <datalist id="email-options">
                                        {uniqueEmails.map(email => (
                                            <option key={email} value={email} />
                                        ))}
                                    </datalist>
                                </>
                            )}

                            <input 
                                type="date"
                                value={filterDate}
                                onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                                className="filter-input-text"
                            />

                            <input 
                                type="text"
                                list="time-options"
                                placeholder="Filter by Slot (e.g. 10:00 AM)"
                                value={filterTime}
                                onChange={(e) => { setFilterTime(e.target.value); setCurrentPage(1); }}
                                className="filter-input-text"
                            />
                            <datalist id="time-options">
                                {uniqueTimes.map(time => (
                                    <option key={time} value={time} />
                                ))}
                            </datalist>

                            {(filterName || filterEmail || filterDate || filterTime) && (
                                <button className="clear-filters-btn" onClick={() => {
                                    setFilterName(''); setFilterEmail(''); setFilterDate(''); setFilterTime(''); setCurrentPage(1);
                                }}>Clear</button>
                            )}
                        </div>

                        {filteredBookings.length === 0 ? (
                            <div className="no-bookings"><p>No bookings match your filters.</p></div>
                        ) : (
                            <div className="bookings-grid">
                                {currentBookings.map((booking) => {
                                // Combine sessionDate and sessionTime for accurate comparison
                                const bookingDateTimeString = `${booking.sessionDate.split('T')[0]} ${booking.sessionTime}`;
                                const isUpcoming = new Date(bookingDateTimeString) >= new Date();
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
                                                <div className="booking-person-details">
                                                    <p className="booking-person"><strong>Candidate Name:</strong> {booking.candidateName}</p>
                                                    <p className="booking-person"><strong>Qualification:</strong> {booking.qualification}</p>
                                                    <p className="booking-person"><strong>Email:</strong> {booking.email}</p>
                                                </div>
                                            )}

                                            <div className="booking-details">
                                                <div className="detail-item">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                    {booking.sessionTime}
                                                </div>
                                            </div>

                                            {isUpcoming && (
                                                <div className="booking-actions">
                                                    <a 
                                                        href={`/session/${booking._id}`} 
                                                        className="join-session-btn"
                                                        target="_blank"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                                        Join Session
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        )}
                        {filteredBookings.length > 0 && (
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
                    </>
                )}
            </div>
        );
    };

    const renderSlots = () => (
        <div className="profile-bookings">
            {user.mentorId ? (
                <SlotManager mentorId={user.mentorId} />
            ) : (
                <div className="no-bookings">
                    <p>You need a Mentor ID to manage slots. Please contact admin.</p>
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="profile-header">
            <div className="profile-info">
                {isEditing ? (
                    <form onSubmit={handleSaveProfile} className="edit-profile-form">
                        {/* Photo edit */}
                        {/* Passport Photo edit for all roles */}
                        <div className="edit-form-group" style={{ alignItems: 'center' }}>
                            <label>Passport Size Photo</label>
                            <div className="profile-photo-edit">
                                {editPhotoPreview ? (
                                    <>
                                        <div className="profile-photo-preview">
                                            <img src={editPhotoPreview} alt="Preview" />
                                        </div>
                                        <button type="button" className="photo-change-btn" onClick={() => document.getElementById('edit-photo-input').click()}>Change Photo</button>
                                    </>
                                ) : (
                                    <button type="button" className="photo-add-btn" onClick={() => document.getElementById('edit-photo-input').click()}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                        Upload Photo
                                    </button>
                                )}
                                <input type="file" id="edit-photo-input" accept="image/*" onChange={handleEditPhotoChange} style={{ display: 'none' }} />
                            </div>
                        </div>

                        {/* Professional Photo edit specifically for mentors */}
                        {user.role === 'professional' && (
                            <div className="edit-form-group" style={{ alignItems: 'center' }}>
                                <label>Professional Photo (For Featured Card)</label>
                                <div className="profile-photo-edit">
                                    {editProfPhotoPreview ? (
                                        <>
                                            <div className="profile-photo-preview professional">
                                                <img src={editProfPhotoPreview} alt="Preview" />
                                            </div>
                                            <button type="button" className="photo-change-btn" onClick={() => document.getElementById('edit-prof-photo-input').click()}>Change Photo</button>
                                        </>
                                    ) : (
                                        <button type="button" className="photo-add-btn" onClick={() => document.getElementById('edit-prof-photo-input').click()}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            Upload Photo
                                        </button>
                                    )}
                                    <input type="file" id="edit-prof-photo-input" accept="image/*" onChange={handleEditProfPhotoChange} style={{ display: 'none' }} />
                                </div>
                            </div>
                        )}

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
                        <div className="edit-form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={editData.phone}
                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            />
                        </div>

                        {user.role === 'student' && (
                            <>
                                <div className="edit-form-group">
                                    <label>Latest Qualification</label>
                                    <select value={editData.latestQualification} onChange={(e) => setEditData({ ...editData, latestQualification: e.target.value })}>
                                        <option value="" disabled>Select your qualification</option>
                                        <option value="High School">High School (12th)</option>
                                        <option value="Undergraduate">Undergraduate (B.A / B.Sc / B.Com / BBA)</option>
                                        <option value="Graduate">Graduate (B.Tech / B.E / Other)</option>
                                        <option value="Postgraduate">Postgraduate (M.A / M.Sc / M.Com / MBA)</option>
                                        <option value="Doctorate">Doctorate (Ph.D)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="edit-form-group">
                                    <label>Area of Interest</label>
                                    <select value={editData.interest} onChange={(e) => setEditData({ ...editData, interest: e.target.value })}>
                                        <option value="" disabled>Select your interest</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Human Resources">Human Resources</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Business Analytics">Business Analytics</option>
                                        <option value="Entrepreneurship">Entrepreneurship</option>
                                        <option value="Strategy & Consulting">Strategy & Consulting</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="General Management">General Management</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {user.role === 'professional' && (
                            <>
                                <div className="edit-form-group">
                                    <label>Qualification</label>
                                    <select value={editData.qualification} onChange={(e) => setEditData({ ...editData, qualification: e.target.value })}>
                                        <option value="" disabled>Select your qualification</option>
                                        <option value="Undergraduate">Undergraduate (B.A / B.Sc / B.Com / BBA)</option>
                                        <option value="Graduate">Graduate (B.Tech / B.E / Other)</option>
                                        <option value="Postgraduate">Postgraduate (M.A / M.Sc / M.Com / MBA)</option>
                                        <option value="Doctorate">Doctorate (Ph.D)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="edit-form-group">
                                    <label>Profession</label>
                                    <select
                                        value={editData.profession}
                                        onChange={(e) => setEditData({ ...editData, profession: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select your profession</option>
                                        <option value="Management Consultant">Management Consultant</option>
                                        <option value="Investment Banker">Investment Banker</option>
                                        <option value="Finance Manager">Finance Manager</option>
                                        <option value="Marketing Manager">Marketing Manager</option>
                                        <option value="Product Manager">Product Manager</option>
                                        <option value="Operations Manager">Operations Manager</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Business Analyst">Business Analyst</option>
                                        <option value="Data Scientist">Data Scientist</option>
                                        <option value="Strategy Manager">Strategy Manager</option>
                                        <option value="Entrepreneur / Founder">Entrepreneur / Founder</option>
                                        <option value="General Manager">General Manager</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </>
                        )}
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
                        {/* Display Passport Photo for all roles */}
                        {user.photo && (
                            <div className="profile-photo-card">
                                <span className="photo-card-label">Passport Size Photo</span>
                                <div className="decorative-divider"></div>
                                <div className="profile-photo-display">
                                    <img src={user.photo} alt={`${user.name} Passport`} />
                                </div>
                            </div>
                        )}

                        {/* Display Professional Photo specifically for mentors */}
                        {user.role === 'professional' && user.professionalPhoto && (
                            <div className="profile-photo-card professional">
                                <span className="photo-card-label">Professional Photo</span>
                                <div className="decorative-divider"></div>
                                <div className="profile-photo-display">
                                    <img src={user.professionalPhoto} alt={`${user.name} Professional`} />
                                </div>
                            </div>
                        )}

                        <div className="profile-detail-grid">
                            <div className="detail-row">
                                <span className="detail-label">Name</span>
                                <span className="detail-value"><h2>{user.name}</h2></span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Role</span>
                                <span className="detail-value"><span className={`role-badge ${user.role}`}>{user.role}</span></span>
                            </div>

                            {user.phone && (
                                <div className="detail-row">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{user.phone}</span>
                                </div>
                            )}

                            {user.role === 'student' && (
                                <>
                                    {user.latestQualification && (
                                        <div className="detail-row">
                                            <span className="detail-label">Qualification</span>
                                            <span className="detail-value">{user.latestQualification}</span>
                                        </div>
                                    )}
                                    {user.interest && (
                                        <div className="detail-row">
                                            <span className="detail-label">Area of Interest</span>
                                            <span className="detail-value">{user.interest}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {user.role === 'professional' && (
                                <>
                                    {user.mentorId && (
                                        <div className="detail-row">
                                            <span className="detail-label">Mentor ID</span>
                                            <span className="detail-value"><strong>{user.mentorId}</strong></span>
                                        </div>
                                    )}
                                    {user.qualification && (
                                        <div className="detail-row">
                                            <span className="detail-label">Qualification</span>
                                            <span className="detail-value">{user.qualification}</span>
                                        </div>
                                    )}
                                    {user.profession && (
                                        <div className="detail-row">
                                            <span className="detail-label">Profession</span>
                                            <span className="detail-value">{user.profession}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

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
            </div>
        </div>
    );

    // --- Render Active Section ---
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return renderDashboard();
            case 'bookings':
            case 'manage-mentors':
                return renderBookings();
            case 'analytics':
                return <AdminAnalytics />;
            case 'slots':
                return renderSlots();
            case 'profile':
                return renderProfile();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-layout fade-in">
                <ProfileSidebar
                    user={user}
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    onLogout={handleLogout}
                />
                <div className="profile-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
