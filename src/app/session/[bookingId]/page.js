'use client';
import React, { useEffect, useState } from 'react';
import MeetingRoom from '@/components/MeetingRoom';
import { useRouter } from 'next/navigation';

export default function SessionPage({ params }) {
    // Note: in Next.js 14+ params is an object, but sometimes in server components it's an async value.
    // In client components, it's typically available.
    const bookingId = params.bookingId;
    
    const [agoraData, setAgoraData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Fetch token from our API
                const res = await fetch(`/api/agora/token?channelName=${bookingId}`);
                
                // If the response is not 200, it's likely an auth or config issue
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to authenticate for this session');
                }

                const data = await res.json();
                
                if (data.success) {
                    setAgoraData(data);
                } else {
                    throw new Error(data.message || 'Failed to join session');
                }
            } catch (err) {
                console.error('Session Init Error:', err);
                setError(err.message || 'An error occurred while connecting to the session server');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchToken();
        }
    }, [bookingId]);

    const handleLeave = () => {
        // Redirect to profile or dashboard after session ends or user leaves
        router.push('/profile'); 
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: 'white', fontFamily: 'sans-serif' }}>
                <div style={{ 
                    border: '4px solid rgba(255,255,255,0.1)', 
                    borderTop: '4px solid #fff', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    animation: 'spin 1s linear infinite' 
                }}></div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <p style={{ marginTop: '20px', letterSpacing: '1px' }}>INITIALIZING SECURE SESSION...</p>
                <p style={{ fontSize: '0.8rem', color: '#888' }}>Checking booking credentials</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: 'white', fontFamily: 'sans-serif' }}>
                <div style={{ textAlign: 'center', padding: '40px', maxWidth: '500px', background: '#222', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⚠️</div>
                    <h2 style={{ color: '#ff4757', marginBottom: '15px' }}>Access Denied</h2>
                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>{error}</p>
                    <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '20px' }}>
                        Please ensure you are logged in and have a valid booking for this session.
                    </p>
                    <button 
                        onClick={() => router.push('/profile')}
                        style={{ 
                            marginTop: '30px', 
                            padding: '12px 30px', 
                            background: '#fff', 
                            color: '#000', 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <MeetingRoom 
            appId={agoraData.appId} 
            token={agoraData.token} 
            channel={agoraData.channelName} 
            onLeave={handleLeave} 
        />
    );
}
