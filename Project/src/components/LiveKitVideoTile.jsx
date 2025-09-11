import { motion } from 'framer-motion';
import { Mic, MicOff, User } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Track } from 'livekit-client';

const LiveKitVideoTile = ({ 
  participant, 
  isLocal = false, 
  localVideoTrack = null,
  className = '' 
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!participant) return;

    const attachTracks = () => {
      let videoTrack, audioTrack;
      
      if (isLocal) {
        videoTrack = localVideoTrack;
      } else {
        // For remote participants, prioritize screen share, then camera
        const screenPublication = Array.from(participant.trackPublications.values()).find(pub => pub.source === 'screen_share' && pub.isSubscribed);
        const videoPublication = Array.from(participant.trackPublications.values()).find(pub => pub.kind === 'video' && pub.isSubscribed);
        videoTrack = screenPublication?.track || videoPublication?.track;
        // Get audio track for remote participants
        const audioPublication = Array.from(participant.trackPublications.values()).find(pub => pub.kind === 'audio' && pub.isSubscribed);
        audioTrack = audioPublication?.track;
      }

      // Attach video track
      if (videoTrack && videoRef.current) {
        try {
          // Ensure video element is ready
          if (videoRef.current.srcObject !== videoTrack.mediaStream) {
            videoTrack.attach(videoRef.current);
            videoRef.current.play().catch(e => console.warn('Video play failed:', e));
          }
        } catch (error) {
          console.error('Error attaching video track:', error);
        }
      }

      // Attach audio track (only for remote participants)
      if (audioTrack && audioRef.current && !isLocal) {
        audioTrack.attach(audioRef.current);
      }

      return { videoTrack, audioTrack };
    };

    const { videoTrack, audioTrack } = attachTracks();

    // Listen for track subscriptions if remote participant
    if (!isLocal) {
      const onTrackSubscribed = () => {
        setTimeout(attachTracks, 100); // Small delay to ensure track is ready
      };
      
      participant.on('trackSubscribed', onTrackSubscribed);
      
      return () => {
        participant.off('trackSubscribed', onTrackSubscribed);
        // Cleanup
        if (videoTrack && videoRef.current) {
          videoTrack.detach(videoRef.current);
        }
        if (audioTrack && audioRef.current) {
          audioTrack.detach(audioRef.current);
        }
      };
    }

    return () => {
      // Cleanup
      if (videoTrack && videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
      if (audioTrack && audioRef.current) {
        audioTrack.detach(audioRef.current);
      }
    };
  }, [participant, isLocal, localVideoTrack]);

  if (!participant) return null;

  const hasVideo = isLocal ? 
    (localVideoTrack && !localVideoTrack.isMuted) : 
    Array.from(participant.trackPublications.values()).some(pub => 
      (pub.kind === 'video' || pub.source === 'screen_share') && pub.isSubscribed && pub.track && !pub.isMuted
    );
  const isMuted = isLocal ? 
    !participant.isMicrophoneEnabled : 
    !participant.isMicrophoneEnabled;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`video-tile aspect-video relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      {hasVideo ? (
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          controls={false}
          disablePictureInPicture
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#1f2937' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">
              {participant.name || participant.identity}
            </p>
          </div>
        </div>
      )}
      
      {/* Audio element for remote participants */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay />
      )}
      
      {/* Participant info overlay */}
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <div className={`p-1 rounded ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}>
          {isMuted ? (
            <MicOff className="h-3 w-3 text-white" />
          ) : (
            <Mic className="h-3 w-3 text-white" />
          )}
        </div>
        <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          {participant.name || participant.identity} {isLocal && '(You)'}
        </span>
      </div>
    </motion.div>
  );
};

export default LiveKitVideoTile;