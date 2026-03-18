"use client";
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const AdminAnalytics = () => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('mentors'); // 'mentors' or 'candidates'
    const [mentorsPage, setMentorsPage] = useState(1);
    const [candidatesPage, setCandidatesPage] = useState(1);
    const [mentorStatsSort, setMentorStatsSort] = useState({ key: 'name', direction: 'asc' });
    const [candidateStatsSort, setCandidateStatsSort] = useState({ key: 'name', direction: 'asc' });
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
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/admin/bookings');
                const data = await res.json();
                if (data.success) {
                    setBookings(data.data || []);
                } else {
                    setError(data.message || "Failed to fetch data");
                }
            } catch (err) {
                setError("An error occurred while loading analytics.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (isLoading) return <div className="admin-loading">Loading analytics...</div>;
    if (error) return <div className="admin-error">Error: {error}</div>;

    // --- Calculations ---

    // Top mentors by session count
    const mentorCounts = {};
    bookings.forEach(b => {
        if (!mentorCounts[b.mentorId]) {
            mentorCounts[b.mentorId] = { name: b.mentorName, count: 0 };
        }
        mentorCounts[b.mentorId].count++;
    });

    const mentorStats = Object.entries(mentorCounts)
        .map(([id, stat]) => ({ id, name: stat.name, count: stat.count }))
        .sort((a, b) => b.count - a.count);

    // Top candidates by session count
    const candidateMap = {};
    bookings.forEach(b => {
        const key = b.email || b.candidateName;
        if (!candidateMap[key]) {
            candidateMap[key] = { name: b.candidateName, email: b.email, qualification: b.qualification, count: 0 };
        }
        candidateMap[key].count++;
    });
    
    const candidateStats = Object.values(candidateMap)
        .sort((a, b) => b.count - a.count);

    const sortedMentorStats = sortData(mentorStats, mentorStatsSort);
    const indexOfLastMentor = mentorsPage * ITEMS_PER_PAGE;
    const indexOfFirstMentor = indexOfLastMentor - ITEMS_PER_PAGE;
    const currentMentorStats = sortedMentorStats.slice(indexOfFirstMentor, indexOfLastMentor);
    const totalMentorPages = Math.ceil(mentorStats.length / ITEMS_PER_PAGE);

    const sortedCandidateStats = sortData(candidateStats, candidateStatsSort);
    const indexOfLastCandidate = candidatesPage * ITEMS_PER_PAGE;
    const indexOfFirstCandidate = indexOfLastCandidate - ITEMS_PER_PAGE;
    const currentCandidateStats = sortedCandidateStats.slice(indexOfFirstCandidate, indexOfLastCandidate);
    const totalCandidatePages = Math.ceil(candidateStats.length / ITEMS_PER_PAGE);

    return (
        <div className="analytics-dashboard">
            <div className="admin-main-header">
                <h1 className="admin-main-title">Analytics</h1>
            </div>
            <div className="admin-tabs">
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
            </div>

            {activeTab === 'mentors' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="sortable-th" onClick={() => handleSort('name', mentorStatsSort, setMentorStatsSort)}>Mentor Name {renderSortIcon('name', mentorStatsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('id', mentorStatsSort, setMentorStatsSort)}>Mentor ID {renderSortIcon('id', mentorStatsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('count', mentorStatsSort, setMentorStatsSort)}>Total Sessions {renderSortIcon('count', mentorStatsSort)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMentorStats.map((stat, i) => (
                                <tr key={i}>
                                    <td><strong>{stat.name}</strong></td>
                                    <td>{stat.id}</td>
                                    <td>{stat.count}</td>
                                </tr>
                            ))}
                            {mentorStats.length === 0 && (
                                <tr><td colSpan="3" className="empty-row">No mentor data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'mentors' && mentorStats.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => setMentorsPage(mentorsPage - 1)} 
                        disabled={mentorsPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {mentorsPage} of {totalMentorPages}
                    </span>
                    <button 
                        onClick={() => setMentorsPage(mentorsPage + 1)} 
                        disabled={mentorsPage === totalMentorPages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}

            {activeTab === 'candidates' && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="sortable-th" onClick={() => handleSort('name', candidateStatsSort, setCandidateStatsSort)}>Candidate Name {renderSortIcon('name', candidateStatsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('email', candidateStatsSort, setCandidateStatsSort)}>Email {renderSortIcon('email', candidateStatsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('qualification', candidateStatsSort, setCandidateStatsSort)}>Qualification {renderSortIcon('qualification', candidateStatsSort)}</th>
                                <th className="sortable-th" onClick={() => handleSort('count', candidateStatsSort, setCandidateStatsSort)}>Total Sessions {renderSortIcon('count', candidateStatsSort)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCandidateStats.map((stat, i) => (
                                <tr key={i}>
                                    <td><strong>{stat.name}</strong></td>
                                    <td>{stat.email}</td>
                                    <td>{stat.qualification}</td>
                                    <td>{stat.count}</td>
                                </tr>
                            ))}
                            {candidateStats.length === 0 && (
                                <tr><td colSpan="4" className="empty-row">No candidate data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'candidates' && candidateStats.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => setCandidatesPage(candidatesPage - 1)} 
                        disabled={candidatesPage === 1}
                        className="pagination-btn"
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {candidatesPage} of {totalCandidatePages}
                    </span>
                    <button 
                        onClick={() => setCandidatesPage(candidatesPage + 1)} 
                        disabled={candidatesPage === totalCandidatePages}
                        className="pagination-btn"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
