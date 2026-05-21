import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSocket, initSocket } from '../../socket/socket';
import { useTranslation } from 'react-i18next';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiMessageSquare, FiMaximize } from 'react-icons/fi';
import './VideoConsultation.css';

export default function VideoConsultation() {
  const { t } = useTranslation();
  const { id: roomId } = useParams();
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState(t('patient.videoConsultation.statusWaiting'));
  const timerRef = useRef(null);

  const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

  const startTimer = () => { timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000); };
  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const createPeerConnection = useCallback(() => {
    const socket = getSocket();
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = e => { if (e.candidate) socket.emit('ice_candidate', { roomId, candidate: e.candidate }); };
    pc.ontrack = e => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; setIsConnected(true); setStatus(t('patient.videoConsultation.statusConnected')); startTimer(); };
    pc.oniceconnectionstatechange = () => { if (pc.iceConnectionState === 'disconnected') { setIsConnected(false); setStatus(t('patient.videoConsultation.statusLeft')); } };

    return pc;
  }, [roomId]);

  useEffect(() => {
    const socket = initSocket(user?.id);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      socket.emit('join_video_room', { roomId, userId: user?.id });

      socket.on('user_joined_video', async ({ userId }) => {
        setStatus(t('patient.videoConsultation.statusJoining'));
        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('video_offer', { roomId, offer });
      });

      socket.on('video_offer', async ({ offer }) => {
        const pc = createPeerConnection();
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('video_answer', { roomId, answer });
      });

      socket.on('video_answer', async ({ answer }) => {
        if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('ice_candidate', async ({ candidate }) => {
        if (pcRef.current && candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on('user_left_video', () => { setIsConnected(false); setStatus(t('patient.videoConsultation.statusUserLeft')); clearInterval(timerRef.current); });
    }).catch(() => setStatus(t('patient.videoConsultation.statusDenied')));

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socket.emit('leave_video_room', { roomId });
      clearInterval(timerRef.current);
    };
  }, [roomId, user, createPeerConnection]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
      setIsMuted(m => !m);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = isVideoOff; });
      setIsVideoOff(v => !v);
    }
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    navigate(-1);
  };

  return (
    <div className="video-consultation">
      {/* Status bar */}
      <div className="vc-status-bar">
        <div className="vc-logo">🏥 Sehat Video</div>
        <div className="vc-status">
          <div className={`vc-status-dot ${isConnected ? 'connected' : 'waiting'}`} />
          <span>{status}</span>
        </div>
        {isConnected && <div className="vc-timer">{formatTime(callDuration)}</div>}
      </div>

      {/* Video area */}
      <div className="vc-video-area">
        <div className="vc-remote-video">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          {!isConnected && (
            <div className="vc-waiting">
              <div className="vc-waiting-avatar">👨‍⚕️</div>
              <p>{status}</p>
              <div className="vc-pulse-ring" />
            </div>
          )}
        </div>
        <div className="vc-local-video">
          <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          {isVideoOff && <div className="local-video-off">📵</div>}
        </div>
      </div>

      {/* Controls */}
      <div className="vc-controls">
        <button className={`vc-btn ${isMuted ? 'vc-btn-danger' : ''}`} onClick={toggleMute} title={isMuted ? t('patient.videoConsultation.unmute') : t('patient.videoConsultation.mute')}>
          {isMuted ? <FiMicOff size={22} /> : <FiMic size={22} />}
          <span>{isMuted ? t('patient.videoConsultation.unmute') : t('patient.videoConsultation.mute')}</span>
        </button>
        <button className={`vc-btn ${isVideoOff ? 'vc-btn-danger' : ''}`} onClick={toggleVideo} title={isVideoOff ? t('patient.videoConsultation.startVideo') : t('patient.videoConsultation.stopVideo')}>
          {isVideoOff ? <FiVideoOff size={22} /> : <FiVideo size={22} />}
          <span>{isVideoOff ? t('patient.videoConsultation.startVideo') : t('patient.videoConsultation.stopVideo')}</span>
        </button>
        <button className="vc-btn vc-btn-end" onClick={endCall}>
          <FiPhone size={22} style={{ transform: 'rotate(135deg)' }} />
          <span>{t('patient.videoConsultation.endCall')}</span>
        </button>
      </div>
    </div>
  );
}
