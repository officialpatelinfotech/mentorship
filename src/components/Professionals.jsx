"use client";
import React, { useState } from "react";
import "./Professionals.css";

const professors = [
    {
        name: "Dr. Ananya Sharma",
        title: "Strategy & Consulting",
        university: "IIM Ahmedabad",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
    },
    {
        name: "Rajiv Mehta",
        title: "Investment Banking",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Priya Kapoor",
        title: "Product Management",
        university: "IIM Bangalore",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
    },
    {
        name: "Arjun Reddy",
        title: "Entrepreneurship",
        university: "IIM Calcutta",
        profession: "Entrepreneur",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Sneha Patel",
        title: "Marketing & Brand Strategy",
        university: "XLRI Jamshedpur",
        profession: "Marketing",
        image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Vikram Singh",
        title: "Operations Management",
        university: "IIM Ahmedabad",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Kavita Nair",
        title: "Human Resources",
        university: "IIM Bangalore",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=1972&auto=format&fit=crop"
    },
    {
        name: "Rohan Desai",
        title: "Private Equity",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Meera Joshi",
        title: "Data Analytics",
        university: "IIM Calcutta",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Amit Verma",
        title: "Supply Chain & Logistics",
        university: "XLRI Jamshedpur",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
    }
];

const universities = ["All", "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "ISB Hyderabad", "XLRI Jamshedpur"];
const professions = ["All", "Consultant", "Finance", "Technology", "Marketing", "Entrepreneur", "Operations"];

const Professionals = () => {
    const [selectedUniversity, setSelectedUniversity] = useState("All");
    const [selectedProfession, setSelectedProfession] = useState("All");
    const [selectedProfessor, setSelectedProfessor] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 6;

    const filtered = professors.filter((p) => {
        const matchUni = selectedUniversity === "All" || p.university === selectedUniversity;
        const matchProf = selectedProfession === "All" || p.profession === selectedProfession;
        return matchUni && matchProf;
    });

    const totalPages = Math.ceil(filtered.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + cardsPerPage);

    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="professionals-page">
            {/* Hero with background image */}
            <section className="prof-hero">
                <div className="prof-hero-overlay"></div>
                <div className="prof-hero-content">
                    <h1>Our Professionals</h1>
                    <p>Mentors from the world&apos;s top business schools, ready to guide your journey.</p>
                    <a href="/book-session" className="prof-hero-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Book a Session</a>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="prof-filters">
                <div className="filter-group">
                    <label>University</label>
                    <select
                        value={selectedUniversity}
                        onChange={handleFilterChange(setSelectedUniversity)}
                    >
                        {universities.map((u) => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Profession</label>
                    <select
                        value={selectedProfession}
                        onChange={handleFilterChange(setSelectedProfession)}
                    >
                        {professions.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Professor Grid */}
            <section className="prof-grid">
                {paginated.length > 0 ? (
                    paginated.map((prof, index) => (
                        <div
                            key={index}
                            className="prof-card"
                            style={{ backgroundImage: `url(${prof.image})` }}
                        >
                            <div className="prof-card-overlay">
                                <div className="prof-card-info">
                                    <h2>{prof.name}</h2>
                                    <p className="prof-card-title">{prof.title}</p>
                                    <p className="prof-card-uni">{prof.university}</p>
                                    <div className="prof-card-buttons">
                                        <a
                                            href={`/book-session?mentor=${encodeURIComponent(prof.name)}`}
                                            className="prof-card-btn prof-card-btn-primary"
                                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                        >
                                            Book a Session
                                        </a>
                                        <button
                                            className="prof-card-btn prof-card-btn-secondary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedProfessor(prof);
                                            }}
                                        >
                                            Know More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="prof-no-results">
                        <p>No professionals found matching your filters.</p>
                    </div>
                )}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <section className="prof-pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                    >
                        ← Previous
                    </button>
                    <div className="pagination-pages">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`pagination-page ${page === currentPage ? "active" : ""}`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next →
                    </button>
                </section>
            )}

            {/* CTA Banner */}
            <section className="prof-cta">
                <img
                    className="prof-cta-bg"
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop"
                    alt=""
                />
                <div className="prof-cta-overlay"></div>
                <div className="prof-cta-content">
                    <h2>Ready to accelerate<br />your MBA journey?</h2>
                    <p>Connect with top mentors and get real guidance, real insights, and real results.</p>
                    <div className="prof-cta-buttons">
                        <a href="/professionals" className="prof-btn prof-btn-primary">Explore Mentors</a>
                        <a href="/contact-us" className="prof-btn prof-btn-secondary">Contact Us</a>
                    </div>
                </div>
            </section>

            {/* Professor Modal */}
            {selectedProfessor && (
                <div className="prof-modal-overlay" onClick={() => setSelectedProfessor(null)}>
                    <div className="prof-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="prof-modal-close" onClick={() => setSelectedProfessor(null)}>&times;</button>
                        <div className="prof-modal-body">
                            <div className="prof-modal-image">
                                <img src={selectedProfessor.image} alt={selectedProfessor.name} />
                            </div>
                            <div className="prof-modal-text">
                                <h2>{selectedProfessor.name}</h2>
                                <h3>{selectedProfessor.title}</h3>
                                <p className="prof-modal-uni">{selectedProfessor.university}</p>
                                <p className="prof-modal-prof"><strong>Profession:</strong> {selectedProfessor.profession}</p>
                                <p className="prof-modal-desc">
                                    {selectedProfessor.name} brings extensive experience in {selectedProfessor.profession.toLowerCase()}, having graduated from {selectedProfessor.university}. They specialize in helping candidates craft compelling narratives for their applications and preparing them for rigorous interviews.
                                </p>
                                <a
                                    href={`/book-session?mentor=${encodeURIComponent(selectedProfessor.name)}`}
                                    className="prof-modal-btn"
                                    style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                    Book a Session
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Professionals;
