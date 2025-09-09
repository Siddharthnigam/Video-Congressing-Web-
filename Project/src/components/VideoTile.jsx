import { motion } from 'framer-motion';
import { Mic, MicOff, User } from 'lucide-react';

const VideoTile = ({ 
  participant, 
  isLocal = false, 
  isMuted = false, 
  isVideoOff = false,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`video-tile aspect-video ${className}`}
    >
      {isVideoOff ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-white text-sm font-medium">{participant?.name || 'User'}</p>
          </div>
        </div>
      ) : (
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted={isLocal}
          playsInline
        />
      )}
      
      <div className="absolute bottom-2 left-2 flex items-center space-x-2">
        <div className={`p-1 rounded ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}>
          {isMuted ? (
            <MicOff className="h-3 w-3 text-white" />
          ) : (
            <Mic className="h-3 w-3 text-white" />
          )}
        </div>
        <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
          {participant?.name || 'User'} {isLocal && '(You)'}
        </span>
      </div>
    </motion.div>
  );
};

export default VideoTile;