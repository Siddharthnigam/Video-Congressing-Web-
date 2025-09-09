import { useState, useRef, useCallback } from 'react';
import { Room, ConnectionState, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client';

export const useWebRTC = () => {
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  
  const roomRef = useRef(null);
  const isConnectingRef = useRef(false);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Permission denied:', error);
      throw new Error('Camera and microphone permissions are required');
    }
  };

  const connectToRoom = useCallback(async (url, token) => {
    if (isConnectingRef.current || roomRef.current) {
      console.log('Already connecting or connected, skipping...');
      return roomRef.current;
    }
    
    try {
      isConnectingRef.current = true;
      setError(null);
      setConnectionState('connecting');
      
      await requestPermissions();
      
      const livekitRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        // 🔹 Increased video quality to Full HD with higher bitrate
        videoCaptureDefaults: {
          resolution: {
            width: 1920,
            height: 1080,
            frameRate: 30
          }
        },
        publishDefaults: {
          videoEncoding: {
            maxBitrate: 3000000, // ~3 Mbps for sharper video
            maxFramerate: 30
          },
          audioEncoding: {
            maxBitrate: 64000
          }
        }
      });
      roomRef.current = livekitRoom;
      
      livekitRoom.on('participantConnected', (participant) => {
        console.log('Participant connected:', participant.identity);
        setParticipants(prev => {
          const exists = prev.find(p => p.sid === participant.sid);
          return exists ? prev : [...prev, participant];
        });
      });
      
      livekitRoom.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected:', participant.identity);
        setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
      });

      livekitRoom.on('trackSubscribed', (track, publication, participant) => {
        console.log('Track subscribed:', track.kind, participant.identity);
        setParticipants(prev => [...prev]);
      });

      livekitRoom.on('trackUnsubscribed', (track, publication, participant) => {
        console.log('Track unsubscribed:', track.kind, participant.identity);
        setParticipants(prev => [...prev]);
      });

      livekitRoom.on('connectionStateChanged', (state) => {
        console.log('Connection state changed:', state);
        setConnectionState(state);
        setIsConnected(state === ConnectionState.Connected);
      });

      livekitRoom.on('disconnected', () => {
        console.log('Disconnected from room');
        setIsConnected(false);
        setParticipants([]);
        setRoom(null);
        roomRef.current = null;
      });
      
      livekitRoom.on('localTrackPublished', (publication) => {
        if (publication.source === 'camera' && publication.track) {
          setLocalVideoTrack(publication.track);
          setIsVideoEnabled(true);
        }
        if (publication.source === 'microphone' && publication.track) {
          setLocalAudioTrack(publication.track);
          setIsAudioEnabled(true);
        }
      });
      
      livekitRoom.on('localTrackUnpublished', (publication) => {
        if (publication.source === 'camera') {
          setLocalVideoTrack(null);
          setIsVideoEnabled(false);
        }
        if (publication.source === 'microphone') {
          setLocalAudioTrack(null);
          setIsAudioEnabled(false);
        }
      });
      
      livekitRoom.on('trackPublished', () => {
        setParticipants(prev => [...prev]);
      });
      
      livekitRoom.on('trackUnpublished', () => {
        setParticipants(prev => [...prev]);
      });
      
      await livekitRoom.connect(url, token);
      setRoom(livekitRoom);
      
      await livekitRoom.localParticipant.enableCameraAndMicrophone();
      
      const videoPublication = livekitRoom.localParticipant.getTrackPublication('camera');
      const audioPublication = livekitRoom.localParticipant.getTrackPublication('microphone');
      
      if (videoPublication?.track) {
        setLocalVideoTrack(videoPublication.track);
      }
      if (audioPublication?.track) {
        setLocalAudioTrack(audioPublication.track);
      }
      
      setParticipants(Array.from(livekitRoom.remoteParticipants.values()));
      
      isConnectingRef.current = false;
      return livekitRoom;
    } catch (error) {
      console.error('Error connecting to room:', error);
      setError(error.message);
      setConnectionState('disconnected');
      isConnectingRef.current = false;
      throw error;
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    if (roomRef.current) {
      try {
        const newState = !isAudioEnabled;
        await roomRef.current.localParticipant.setMicrophoneEnabled(newState);
        setIsAudioEnabled(newState);
        if (newState) {
          const audioPublication = roomRef.current.localParticipant.getTrackPublication('microphone');
          if (audioPublication?.track) {
            setLocalAudioTrack(audioPublication.track);
          }
        } else {
          setLocalAudioTrack(null);
        }
      } catch (error) {
        console.error('Error toggling audio:', error);
      }
    }
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (roomRef.current) {
      try {
        const newState = !isVideoEnabled;
        await roomRef.current.localParticipant.setCameraEnabled(newState);
        setIsVideoEnabled(newState);
        if (newState) {
          const videoPublication = roomRef.current.localParticipant.getTrackPublication('camera');
          if (videoPublication?.track) {
            setLocalVideoTrack(videoPublication.track);
          }
        } else {
          setLocalVideoTrack(null);
        }
      } catch (error) {
        console.error('Error toggling video:', error);
      }
    }
  }, [isVideoEnabled]);

  const startScreenShare = useCallback(async () => {
    if (roomRef.current) {
      try {
        await roomRef.current.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error starting screen share:', error);
      }
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (roomRef.current) {
      try {
        await roomRef.current.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    }
  }, []);

  const leaveRoom = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      isConnectingRef.current = false;
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsScreenSharing(false);
      setConnectionState('disconnected');
      setError(null);
      setLocalVideoTrack(null);
      setLocalAudioTrack(null);
    }
  }, []);

  return {
    room,
    isConnected,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    connectionState,
    error,
    localVideoTrack,
    localAudioTrack,
    connectToRoom,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
    requestPermissions
  };
};