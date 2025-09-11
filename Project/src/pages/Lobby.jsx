import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Mic, Settings, Plus, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useRoom } from '../context/RoomContext';
import { api } from '../services/api';

const Lobby = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { joinRoom } = useRoom();
  const { devices, selectedDevices, setSelectedDevices, getMediaStream, stopStream } = useMediaDevices();
  
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [action, setAction] = useState('create'); // 'create' or 'join'
  
  const videoRef = useRef(null);

  // Get action from URL params
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam === 'join') {
      setAction('join');
    } else {
      setAction('create');
    }
  }, [searchParams]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await getMediaStream();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media:', error);
      }
    };

    initializeMedia();
    
    return () => {
      stopStream();
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await getMediaStream();
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setPermissionError(null);
      } catch (error) {
        console.error('Error accessing media:', error);
        setPermissionError('Camera and microphone access required');
      }
    };

    checkPermissions();
    
    return () => {
      stopStream();
    };
  }, []);

  const handleJoinMeeting = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (action === 'join' && !roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      if (action === 'create') {
        response = await api.createRoom(name, 'Meeting Room');
        console.log('Create room response:', response);
        joinRoom(response.room_id, name, true, response.livekit_url, response.token);
      } else {
        const formattedRoomId = roomId.startsWith('room-') ? roomId : `room-${roomId}`;
        response = await api.joinRoom(formattedRoomId, name);
        console.log('Join room response:', response);
        joinRoom(formattedRoomId, name, false, response.livekit_url, response.token);
      }
      
      stopStream();
      navigate('/meeting');
    } catch (error) {
      console.error('Error joining room:', error);
      if (error.message.includes('permission')) {
        setPermissionError('Camera and microphone permissions are required');
      } else {
        alert('Failed to join room. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPermissions = async () => {
    try {
      setPermissionError(null);
      const stream = await getMediaStream();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      setPermissionError('Please allow camera and microphone access in your browser settings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Action Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setAction('create')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                action === 'create' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>Create Meeting</span>
            </button>
            <button
              onClick={() => setAction('join')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                action === 'join' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Join Meeting</span>
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              {action === 'create' ? 'Create Meeting' : 'Join Meeting'}
            </h1>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Video Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Video Preview</h2>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                  />
                  {(!isVideoEnabled || permissionError) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">
                          {permissionError || 'Camera is off'}
                        </p>
                        {permissionError && (
                          <Button 
                            size="sm" 
                            onClick={handleRetryPermissions}
                            className="mt-2"
                          >
                            Allow Access
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={isVideoEnabled ? 'primary' : 'secondary'}
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                    className="control-btn"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={isAudioEnabled ? 'primary' : 'secondary'}
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className="control-btn"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSettings(!showSettings)}
                    className="control-btn"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Meeting Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {action === 'join' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting ID
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter meeting ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Camera
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        {devices.cameras.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Microphone
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        {devices.microphones.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
                
                <Button
                  onClick={handleJoinMeeting}
                  className={`w-full ${action === 'create' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : (action === 'create' ? 'Create Meeting' : 'Join Now')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Lobby;
