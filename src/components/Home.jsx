"use client";
import React, { useState, useEffect } from "react";
import "./Home.css";

const Home = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [featuredMentors, setFeaturedMentors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await fetch('/api/public/featured-mentors');
                const data = await res.json();
                if (data.success) {
                    setFeaturedMentors(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch featured mentors:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    // Fallback categories if no mentors are featured yet
    const defaultCategories = [
        {
            _id: '1',
            name: "MBA Mentorship",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop",
            title: "Expert Guidance",
            about: "1-on-1 guidance from top B-school alumni to navigate your MBA journey."
        },
        {
            _id: '2',
            name: "B-School Prep",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
            title: "Admission Success",
            about: "Comprehensive preparation strategies for MBA admissions processes."
        },
        {
            _id: '3',
            name: "Career Guidance",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
            title: "Professional Growth",
            about: "Expert advice on career transitions, promotions, and industry pivots."
        },
        {
            _id: '4',
            name: "Premium Packages",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
            title: "End-to-End Support",
            about: "End-to-end support bundles covering all aspects of your application."
        }
    ];

    const displayItems = featuredMentors.length > 0 ? featuredMentors : defaultCategories;

    return (
        <div className="home">
            <section className="hero">
                <video
                    className="hero-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                </video>
                <div className="hero-content">
                    <h1>
                        Empowering Your<br />MBA Journey
                    </h1>
                    <p>Premium mentorship and guidance from industry experts and top B-school alumni.</p>
                    <div className="hero-buttons">
                        <a href="/professionals" className="hero-btn hero-btn-primary">Explore Mentors</a>
                    </div>
                </div>
            </section>

            <section className="featured-grid">
                {displayItems.map((item, index) => (
                    <div
                        key={item._id || index}
                        className="grid-item"
                        style={{ backgroundImage: `url(${item.image})` }}
                    >
                        <div className="overlay">
                            <h2>{item.name || item.title}</h2>
                            <div className="grid-buttons">
                                <a
                                    href={`/book-session`}
                                    className="grid-btn grid-btn-primary"
                                    style={{ textDecoration: 'none', display: 'inline-block' }}
                                >
                                    Book a Session
                                </a>
                                <button
                                    className="grid-btn grid-btn-secondary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedCategory(item);
                                    }}
                                >
                                    Know More
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* Feature Highlight Section */}
            <section className="feature-section">
                <div className="feature-header">
                    <span className="feature-label">Mentorship Done Right</span>
                    <h2>Every mentor is hand-picked, rigorously vetted, and committed to delivering results that speak for themselves.</h2>
                </div>
                <div className="feature-split">
                    <div className="feature-image">
                        <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Mentorship session" />
                    </div>
                    <div className="feature-text">
                        <h3>Personalized Guidance</h3>
                        <p>Every journey is unique. Our mentors craft tailored strategies to help you navigate admissions, interviews, and career transitions with confidence.</p>
                        <a href="/personalized-guidance" className="feature-btn">Learn More</a>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="story-section">
                <div className="story-text">
                    <h2>Our Story</h2>
                    <p>MBA Mentorship was founded by a group of top B-school alumni — professionals with a passion for education, a track record of excellence, and a belief that the right guidance can transform careers. This is the mentorship they wished they had. Now, it&apos;s yours.</p>
                    <a href="/about-us" className="story-btn">Learn more</a>
                </div>
                <div className="story-image">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Our team" />
                </div>
            </section>

            {/* CTA Banner */}
            <section className="cta-banner">
                <img className="cta-bg" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop" alt="" />
                <div className="cta-overlay"></div>
                <div className="cta-content">
                    <h2>Ready to accelerate<br />your MBA journey?</h2>
                    <p>Connect with top mentors and get real guidance, real insights, and real results.</p>
                    <div className="cta-buttons">
                        <a href="/professionals" className="cta-btn cta-btn-primary">Explore Mentors</a>
                        <a href="/contact-us" className="cta-btn cta-btn-secondary">Contact Us</a>
                    </div>
                </div>
            </section>

            {/* Category Modal */}
            {selectedCategory && (
                <div className="home-modal-overlay" onClick={() => setSelectedCategory(null)}>
                    <div className="home-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="home-modal-close" onClick={() => setSelectedCategory(null)}>&times;</button>
                        <div className="home-modal-body">
                            <div className="home-modal-image">
                                <img src={selectedCategory.image} alt={selectedCategory.name || selectedCategory.title} />
                            </div>
                            <div className="home-modal-text">
                                <h2>{selectedCategory.name || selectedCategory.title}</h2>
                                <h3>{selectedCategory.title || selectedCategory.description}</h3>
                                <p className="home-modal-desc">{selectedCategory.about || selectedCategory.details}</p>
                                <a
                                    href="/book-session"
                                    className="home-modal-btn"
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

export default Home;