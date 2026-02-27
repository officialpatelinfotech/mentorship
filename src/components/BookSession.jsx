"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import "./BookSession.css";

// Temporarily importing professors list here or you can fetch it. For now hardcode or pass it.
// To keep it simple, we'll redefine the same list or fetch it if it were an API.
const professors = [
    {
        id: "m_001",
        name: "Dr. Ananya Sharma",
        title: "Strategy & Consulting",
        university: "IIM Ahmedabad",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
    },
    {
        id: "m_002",
        name: "Rajiv Mehta",
        title: "Investment Banking",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: "m_003",
        name: "Priya Kapoor",
        title: "Product Management",
        university: "IIM Bangalore",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
    },
    {
        id: "m_004",
        name: "Arjun Reddy",
        title: "Entrepreneurship",
        university: "IIM Calcutta",
        profession: "Entrepreneur",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: "m_005",
        name: "Sneha Patel",
        title: "Marketing & Brand Strategy",
        university: "XLRI Jamshedpur",
        profession: "Marketing",
        image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: "m_006",
        name: "Vikram Singh",
        title: "Operations Management",
        university: "IIM Ahmedabad",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: "m_007",
        name: "Kavita Nair",
        title: "Human Resources",
        university: "IIM Bangalore",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=1972&auto=format&fit=crop"
    },
    {
        id: "m_008",
        name: "Rohan Desai",
        title: "Private Equity",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: "m_009",
        name: "Meera Joshi",
        title: "Data Analytics",
        university: "IIM Calcutta",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: "m_010",
        name: "Amit Verma",
        title: "Supply Chain & Logistics",
        university: "XLRI Jamshedpur",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
    }
];

const BookSession = () => {
    const searchParams = useSearchParams();
    const mentorName = searchParams.get("mentor");
    const [mentor, setMentor] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        qualification: "",
        sessionFor: ""
    });

    // Calendar state
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Step state
    const [step, setStep] = useState(1);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', message: '' }

    useEffect(() => {
        if (mentorName) {
            const foundMentor = professors.find((p) => p.name === mentorName);
            setMentor(foundMentor || professors[0]); // Default to first if not found
        } else {
            setMentor(professors[0]); // Default to first if no param
        }
    }, [mentorName]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Calendar Logic ---
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
        }

        // Actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0)); // Disable past dates

            days.push(
                <div
                    key={day}
                    className={`cal-day ${isSelected ? "selected" : ""} ${isPast ? "disabled" : ""}`}
                    onClick={() => !isPast && setSelectedDate(dateObj)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // --- Time Slots Logic ---
    const generateTimeSlots = () => {
        const slots = [];
        let startHour = 10; // 10 AM
        let endHour = 17; // 5 PM (17:00)

        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += 15) {
                const timeStr = `${h > 12 ? h - 12 : h}:${m === 0 ? "00" : m} ${h >= 12 ? "PM" : "AM"}`;
                slots.push(timeStr);
            }
        }
        return slots;
    };

    const handleNextStep = () => {
        if (!formData.name || !formData.phone || !formData.email || !formData.qualification || !formData.sessionFor) {
            setSubmitStatus({ type: 'error', message: 'Please fill in all candidate details.' });
            return;
        }
        setSubmitStatus(null);
        setStep(2);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            setSubmitStatus({ type: 'error', message: 'Please select a date and time.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const payload = {
                ...formData,
                mentorId: mentor.id,
                mentorName: mentor.name,
                sessionDate: selectedDate.toISOString(),
                sessionTime: selectedTime
            };

            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitStatus({ type: 'success', message: 'Your session has been successfully booked!' });
                // Optional: reset form 
                // setFormData({ name: "", phone: "", email: "", qualification: "", sessionFor: "" });
            } else {
                setSubmitStatus({ type: 'error', message: result.message || 'Failed to book session.' });
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!mentor) return <div className="book-loading">Loading mentor details...</div>;

    return (
        <div className="book-page">
            <div className="book-container">

                {/* Left Side: Mentor Details */}
                <div className="book-left">
                    <div className="book-mentor-card">
                        <div className="mentor-img-wrapper">
                            <img src={mentor.image} alt={mentor.name} />
                        </div>
                        <div className="mentor-info">
                            <h2>{mentor.name}</h2>
                            <p className="mentor-title">{mentor.title}</p>
                            <div className="mentor-badges">
                                <span className="badge uni">{mentor.university}</span>
                                <span className="badge prof">{mentor.profession}</span>
                            </div>
                            <div className="mentor-meta">
                                <div className="meta-item">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <span>15 Min Session</span>
                                </div>
                                <div className="meta-item">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z"></path></svg>
                                    <span>Google Meet</span>
                                </div>
                            </div>
                            <p className="mentor-desc">
                                Get personalized guidance, resume review, and interview prep from {mentor.name}. Book a time below to secure your 1-on-1 session.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Booking Form & Calendar */}
                <div className="book-right">
                    <div className="book-form-section">
                        {step === 1 && (
                            <div className="candidate-form fade-in" style={{ paddingTop: 0, borderTop: 'none' }}>
                                <h3>Candidate Details</h3>
                                <p className="selected-slot-text" style={{ background: 'transparent', padding: 0, borderLeft: 'none', marginBottom: '24px' }}>
                                    Please tell us a bit about yourself.
                                </p>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 9876543210" required />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Email Address *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Latest Qualification *</label>
                                        <select name="qualification" value={formData.qualification} onChange={handleInputChange} required>
                                            <option value="" disabled>Select Qualification</option>
                                            <option value="B.Tech/B.E.">B.Tech/B.E.</option>
                                            <option value="B.Com/BBA">B.Com/BBA</option>
                                            <option value="BA/BSc">BA/BSc</option>
                                            <option value="Masters/PG">Masters/PG</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Booking Session For *</label>
                                        <select name="sessionFor" value={formData.sessionFor} onChange={handleInputChange} required>
                                            <option value="" disabled>Select Reason</option>
                                            <option value="MBA Admissions Strategy">MBA Admissions Strategy</option>
                                            <option value="Resume/Essay Review">Resume/Essay Review</option>
                                            <option value="Mock Interview">Mock Interview</option>
                                            <option value="Career Transition">Career Transition</option>
                                            <option value="General Guidance">General Guidance</option>
                                        </select>
                                    </div>
                                </div>

                                {submitStatus && (
                                    <div className={`submit-status ${submitStatus.type}`} style={{
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginBottom: '20px',
                                        backgroundColor: submitStatus.type === 'error' ? '#fee2e2' : '#dcfce7',
                                        color: submitStatus.type === 'error' ? '#b91c1c' : '#15803d',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}>
                                        {submitStatus.message}
                                    </div>
                                )}

                                <button className="confirm-booking-btn" onClick={handleNextStep}>Next ➔</button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="calendar-section fade-in">
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
                                    <button
                                        onClick={() => { setStep(1); setSubmitStatus(null); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold', color: '#64748b' }}
                                    >
                                        &larr; Back
                                    </button>
                                    <h3 style={{ margin: 0 }}>Select Date & Time</h3>
                                </div>

                                <div className="calendar-time-wrapper">
                                    {/* Calendar View */}
                                    <div className={`calendar-container ${selectedDate ? 'shrink' : ''}`}>
                                        <div className="cal-header">
                                            <button onClick={prevMonth} className="cal-nav">&lt;</button>
                                            <span className="cal-month">{monthNames[currentMonth]} {currentYear}</span>
                                            <button onClick={nextMonth} className="cal-nav">&gt;</button>
                                        </div>
                                        <div className="cal-weekdays">
                                            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                                        </div>
                                        <div className="cal-grid">
                                            {generateCalendar()}
                                        </div>
                                    </div>

                                    {/* Time Slots View (Shows only when date selected) */}
                                    {selectedDate && (
                                        <div className="time-slots-container">
                                            <div className="time-header">
                                                <h4>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                                            </div>
                                            <div className="slots-list">
                                                {generateTimeSlots().map((time, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                        onClick={() => setSelectedTime(time)}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedDate && selectedTime && (
                                    <p className="selected-slot-text" style={{ marginTop: '20px' }}>
                                        Booking for: <strong>{selectedDate.toLocaleDateString()} at {selectedTime}</strong>
                                    </p>
                                )}

                                {submitStatus && (
                                    <div className={`submit-status ${submitStatus.type}`} style={{
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginBottom: '20px',
                                        backgroundColor: submitStatus.type === 'error' ? '#fee2e2' : '#dcfce7',
                                        color: submitStatus.type === 'error' ? '#b91c1c' : '#15803d',
                                        fontWeight: '500',
                                        fontSize: '0.9rem'
                                    }}>
                                        {submitStatus.message}
                                    </div>
                                )}

                                {selectedDate && selectedTime && (
                                    <button
                                        className="confirm-booking-btn"
                                        onClick={handleBookingSubmit}
                                        disabled={isSubmitting}
                                        style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

// NextJS 13+ App router needs a Suspense wrapper for useSearchParams if deployed statically, but we can just export the component.
// For best practice in App router with searchParams, we normally wrap it:
const BookSessionPageWrapper = () => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <BookSession />
        </React.Suspense>
    );
};

export default BookSessionPageWrapper;
