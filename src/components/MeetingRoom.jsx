'use client';
import React, { useEffect, useState } from 'react';
import {
  AgoraRTCProvider,
  useRTCClient,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  RemoteUser,
  LocalVideoTrack,
  useJoin,
  usePublish,
} from 'agora-rtc-react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import './MeetingRoom.css';

const MeetingRoomContent = ({ appId, token, channel, onLeave }) => {
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // Get local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  // Join the channel
  useJoin({
    appid: appId,
    channel: channel,
    token: token,
  });

  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Get remote users
  const remoteUsers = useRemoteUsers();

  // Timer logic for 15-minute session
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session ended. Thank you for your time!");
      onLeave();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onLeave]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="meeting-room-container">
      <div className="meeting-header">
        <h2>Mentorship Session</h2>
        <div className="timer-badge">Ends in: {formatTime(timeLeft)}</div>
      </div>

      <div className="video-grid">
        <div className="video-player">
          {localCameraTrack ? (
            <LocalVideoTrack track={localCameraTrack} play={true} />
          ) : (
            <div className="no-video">Camera Off</div>
          )}
          <div className="player-label">You</div>
        </div>

        {remoteUsers.map((user) => (
          <div className="video-player" key={user.uid}>
            <RemoteUser user={user} playVideo={true} playAudio={true} />
            <div className="player-label">Partner</div>
          </div>
        ))}

        {remoteUsers.length === 0 && (
          <div className="video-player waiting">
            <div className="status-message">Waiting for your partner to join...</div>
          </div>
        )}
      </div>

      <div className="controls-bar">
        <button 
          className={`control-btn ${micOn ? 'active' : ''}`} 
          onClick={() => setMic(!micOn)}
          title={micOn ? "Mute Mic" : "Unmute Mic"}
        >
          {micOn ? '🎤' : '🔇'}
        </button>
        <button 
          className={`control-btn ${cameraOn ? 'active' : ''}`} 
          onClick={() => setCamera(!cameraOn)}
          title={cameraOn ? "Stop Video" : "Start Video"}
        >
          {cameraOn ? '📹' : '🚫'}
        </button>
        <button 
          className="control-btn end-call" 
          onClick={onLeave}
          title="End Session"
        >
          📞
        </button>
      </div>
    </div>
  );
};

const MeetingRoom = ({ appId, token, channel, onLeave }) => {
  // Initialize Agora Client
  const client = useRTCClient(AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' }));

  return (
    <AgoraRTCProvider client={client}>
      <MeetingRoomContent appId={appId} token={token} channel={channel} onLeave={onLeave} />
    </AgoraRTCProvider>
  );
};

export default MeetingRoom;
