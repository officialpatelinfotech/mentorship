"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./SlotManager.css";

const SlotManager = ({ mentorId }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [savedSlots, setSavedSlots] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const formatDate = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const fetchSlots = useCallback(async (dateStr) => {
        if (!mentorId || !dateStr) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/slots?mentorId=${mentorId}&date=${dateStr}`);
            const data = await res.json();
            if (data.success) {
                setSavedSlots(data.data || []);
            }
        } catch (err) {
            console.error("Error fetching slots:", err);
        } finally {
            setIsLoading(false);
        }
    }, [mentorId]);

    useEffect(() => {
        if (selectedDate) {
            const dateStr = formatDate(selectedDate);
            fetchSlots(dateStr);
            setSelectedSlots([]);
            setStatusMsg(null);
        }
    }, [selectedDate, fetchSlots]);

    // Calendar helpers
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="sm-cal-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(currentYear, currentMonth, day);
            const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

            days.push(
                <div
                    key={day}
                    className={`sm-cal-day ${isSelected ? "selected" : ""} ${isPast ? "disabled" : ""}`}
                    onClick={() => !isPast && setSelectedDate(dateObj)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else { setCurrentMonth(currentMonth + 1); }
    };

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else { setCurrentMonth(currentMonth - 1); }
    };

    // Time slot generation — grouped by period, 30-min intervals
    const generateGroupedSlots = () => {
        const groups = [
            { label: "Morning", icon: "🌅", start: 6, end: 12 },
            { label: "Afternoon", icon: "☀️", start: 12, end: 17 },
            { label: "Evening", icon: "🌙", start: 17, end: 22 },
        ];

        return groups.map(group => {
            const slots = [];
            for (let h = group.start; h < group.end; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    const period = h >= 12 ? "PM" : "AM";
                    const timeStr = `${hour}:${m === 0 ? "00" : m} ${period}`;
                    slots.push(timeStr);
                }
            }
            return { ...group, slots };
        });
    };

    const savedTimeSet = new Set(savedSlots.map(s => s.time));

    const toggleSlot = (time) => {
        if (savedTimeSet.has(time)) return;
        setSelectedSlots(prev =>
            prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
        );
    };

    const handleSaveSlots = async () => {
        if (selectedSlots.length === 0) {
            setStatusMsg({ type: "error", message: "Please select at least one time slot." });
            return;
        }

        setIsSaving(true);
        setStatusMsg(null);

        try {
            const dateStr = formatDate(selectedDate);
            const res = await fetch("/api/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId,
                    slots: selectedSlots.map(time => ({ date: dateStr, time })),
                }),
            });
            const data = await res.json();
            if (data.success) {
                setStatusMsg({ type: "success", message: data.message || "Slots saved!" });
                setSelectedSlots([]);
                fetchSlots(dateStr);
            } else {
                setStatusMsg({ type: "error", message: data.message || "Failed to save." });
            }
        } catch (err) {
            setStatusMsg({ type: "error", message: "An error occurred." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        try {
            const res = await fetch(`/api/slots?id=${slotId}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                const dateStr = formatDate(selectedDate);
                fetchSlots(dateStr);
                setStatusMsg({ type: "success", message: "Slot removed." });
            } else {
                setStatusMsg({ type: "error", message: data.message || "Failed to delete." });
            }
        } catch (err) {
            setStatusMsg({ type: "error", message: "An error occurred." });
        }
    };

    const groupedSlots = generateGroupedSlots();

    return (
        <div className="slot-manager">
            <h3 className="sm-title">Manage Your Availability</h3>
            <p className="sm-subtitle">Select a date, then pick time slots to open for students.</p>

            {/* Calendar */}
            <div className="sm-calendar">
                <div className="sm-cal-header">
                    <button onClick={prevMonth} className="sm-cal-nav">&lt;</button>
                    <span className="sm-cal-month">{monthNames[currentMonth]} {currentYear}</span>
                    <button onClick={nextMonth} className="sm-cal-nav">&gt;</button>
                </div>
                <div className="sm-cal-weekdays">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="sm-cal-grid">
                    {generateCalendar()}
                </div>
            </div>

            {/* Time Slots — shown after date selection */}
            {selectedDate && (
                <div className="sm-timeslots">
                    <h4 className="sm-date-label">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </h4>

                    {isLoading ? (
                        <p className="sm-loading">Loading slots...</p>
                    ) : (
                        <>
                            {/* Grouped time slots */}
                            {groupedSlots.map(group => (
                                <div key={group.label} className="sm-group">
                                    <div className="sm-group-header">
                                        <span className="sm-group-icon">{group.icon}</span>
                                        <span className="sm-group-label">{group.label}</span>
                                    </div>
                                    <div className="sm-slots-grid">
                                        {group.slots.map((time, idx) => {
                                            const isSaved = savedTimeSet.has(time);
                                            const isBookedSlot = savedSlots.find(s => s.time === time && s.isBooked);
                                            const isSelected = selectedSlots.includes(time);

                                            let className = "sm-slot";
                                            if (isBookedSlot) className += " booked";
                                            else if (isSaved) className += " saved";
                                            else if (isSelected) className += " selected";

                                            return (
                                                <button
                                                    key={idx}
                                                    className={className}
                                                    onClick={() => toggleSlot(time)}
                                                    disabled={!!isBookedSlot}
                                                    title={isBookedSlot ? "Already booked" : isSaved ? "Already available" : "Click to mark available"}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="sm-legend">
                                <span className="legend-item"><span className="legend-dot selected"></span> Selected</span>
                                <span className="legend-item"><span className="legend-dot saved"></span> Available</span>
                                <span className="legend-item"><span className="legend-dot booked"></span> Booked</span>
                            </div>

                            {/* Actions */}
                            <div className="sm-actions">
                                {selectedSlots.length > 0 && (
                                    <button className="sm-save-btn" onClick={handleSaveSlots} disabled={isSaving}>
                                        {isSaving ? "Saving..." : `Save ${selectedSlots.length} Slot${selectedSlots.length > 1 ? "s" : ""}`}
                                    </button>
                                )}

                                {statusMsg && (
                                    <div className={`sm-status ${statusMsg.type}`}>
                                        {statusMsg.message}
                                    </div>
                                )}
                            </div>

                            {/* Saved slots summary */}
                            {savedSlots.length > 0 && (
                                <div className="sm-saved-list">
                                    <h4>Saved Slots for this Date</h4>
                                    <div className="sm-saved-items">
                                        {savedSlots.map(slot => (
                                            <div key={slot._id} className={`sm-saved-item ${slot.isBooked ? "booked" : ""}`}>
                                                <span>{slot.time}</span>
                                                {slot.isBooked ? (
                                                    <span className="sm-booked-badge">Booked</span>
                                                ) : (
                                                    <button className="sm-delete-btn" onClick={() => handleDeleteSlot(slot._id)} title="Remove slot">×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SlotManager;
