import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Camera, CameraOff, Monitor, Phone, 
  MessageSquare, Users, Settings, Loader, AlertTriangle 
} from 'lucide-react';
import LiveKitVideoTile from '../components/LiveKitVideoTile';
import Button from '../components/Button';
import AttentionBanner from '../components/AttentionBanner';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAttentionDetection } from '../hooks/useAttentionDetection';
import { useRoom } from '../context/RoomContext';
import { api } from '../services/api';

const MeetingRoom = () => {
  const navigate = useNavigate();
  const { roomId, roomName, isHost, showChat, showParticipants, toggleChat, toggleParticipants, leaveRoom, livekitUrl, livekitToken, userName } = useRoom();
  const { 
    room, isConnected, participants, isAudioEnabled, isVideoEnabled, isScreenSharing, connectionState, error, localVideoTrack,
    connectToRoom, toggleAudio, toggleVideo, startScreenShare, stopScreenShare, leaveRoom: leaveWebRTC
  } = useWebRTC();

  const [showHostPanel, setShowHostPanel] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [participantAttention, setParticipantAttention] = useState({});
  const [distractedParticipants, setDistractedParticipants] = useState([]);
  
  const { isEnabled: isAttentionEnabled, status, confidence, lastChangeAt, toggleDetection, startDetection, stopDetection } = useAttentionDetection();

  // Mock participant attention data
  useEffect(() => {
    if (!isAttentionEnabled || !participants.length) return;

    const interval = setInterval(() => {
      const newAttentionData = {};
      const newDistracted = [];

      participants.forEach(participant => {
        const randomConfidence = Math.random();
        const isDistracted = randomConfidence < 0.4;
        
        newAttentionData[participant.sid] = {
          confidence: randomConfidence,
          status: isDistracted ? 'distracted' : 'focused',
          lastUpdate: Date.now()
        };

        if (isDistracted) {
          newDistracted.push({
            name: participant.name || participant.identity,
            confidence: randomConfidence
          });
        }
      });

      setParticipantAttention(newAttentionData);
      setDistractedParticipants(newDistracted);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAttentionEnabled, participants]);

  // Connect to LiveKit room on component mount
  useEffect(() => {
    let mounted = true;
    
    const connectToLiveKit = async () => {
      if (livekitUrl && livekitToken && !isConnected && !isConnecting && mounted) {
        console.log('Connecting to LiveKit:', { livekitUrl, livekitToken });
        setIsConnecting(true);
        try {
          await connectToRoom(livekitUrl, livekitToken);
        } catch (error) {
          console.error('Failed to connect to room:', error);
        } finally {
          if (mounted) {
            setIsConnecting(false);
          }
        }
      }
    };

    if (livekitUrl && livekitToken && !room) {
      connectToLiveKit();
    }
    
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Are you sure you want to leave the meeting?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      mounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [livekitUrl, livekitToken, room]);

  // Load chat messages
  useEffect(() => {
    const loadMessages = async () => {
      if (roomId) {
        try {
          const messages = await api.getMessages(roomId);
          setChatMessages(messages);
        } catch (error) {
          console.error('Failed to load messages:', error);
        }
      }
    };
    loadMessages();
  }, [roomId]);

  // Start/stop attention detection based on video state
  useEffect(() => {
    if (isAttentionEnabled && localVideoTrack && isVideoEnabled) {
      startDetection(localVideoTrack);
    } else {
      stopDetection();
    }
  }, [isAttentionEnabled, localVideoTrack, isVideoEnabled, startDetection, stopDetection]);

  const handleLeaveRoom = async () => {
    await leaveWebRTC();
    leaveRoom();
    navigate('/');
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && roomId) {
      try {
        const newMessage = await api.sendMessage(roomId, userName, chatMessage.trim());
        setChatMessages(prev => [...prev, newMessage]);
        setChatMessage('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const getGridCols = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Show loading state while connecting
  if ((isConnecting || connectionState === 'connecting') && !isConnected) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Connecting to meeting...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">Failed to connect: {error}</p>
          <Button onClick={() => navigate('/')} variant="secondary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const allParticipants = room ? [room.localParticipant, ...participants] : [];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold">{roomName || 'Meeting Room'}</h1>
          <p className="text-gray-400 text-sm">Room ID: {roomId}</p>
          {isAttentionEnabled && !isHost && (
            <p className="text-yellow-400 text-xs">Attention: {status} | Confidence: {Math.round(confidence * 100)}%</p>
          )}
          
          {/* Host Distraction Notifications */}
          {isHost && isAttentionEnabled && distractedParticipants.length > 0 && (
            <div className="flex items-center space-x-2 mt-1">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <p className="text-orange-400 text-xs">
                {distractedParticipants.length} participant{distractedParticipants.length > 1 ? 's' : ''} distracted
              </p>
            </div>
          )}
        </div>
        {isHost && (
          <Button
            variant="ghost"
            onClick={() => setShowHostPanel(!showHostPanel)}
            className="text-white hover:bg-gray-700"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Small Corner Warning Banner - Only for non-host users */}
      {!isHost && isAttentionEnabled && status === 'distracted' && (
        <div className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            <span className="text-xs font-medium">👀 Focus!</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <div className={`grid ${getGridCols(allParticipants.length)} gap-4 h-full`}>
            {allParticipants.map((participant) => (
              <LiveKitVideoTile
                key={participant.sid}
                participant={participant}
                isLocal={participant === room?.localParticipant}
                localVideoTrack={participant === room?.localParticipant ? localVideoTrack : null}
              />
            ))}
          </div>
        </div>
{/* Small Corner Warning Banner - Only for non-host users */}
{!isHost && isAttentionEnabled && status === 'distracted' && (
  <div className="fixed bottom-20 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg animate-pulse">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
      <span className="text-xs font-medium">👀 Focus!</span>
    </div>
  </div>
)}

        {/* Side Panels */}
        <AnimatePresence>
          {(showChat || showParticipants || showHostPanel) && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              {/* Panel Tabs */}
              <div className="flex border-b border-gray-200">
                {showChat && (
                  <button
                    onClick={toggleChat}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Chat
                  </button>
                )}
                {showParticipants && (
                  <button
                    onClick={toggleParticipants}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Participants ({participants.length + 1})
                  </button>
                )}
                {showHostPanel && isHost && (
                  <button
                    onClick={() => setShowHostPanel(!showHostPanel)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Host Controls
                  </button>
                )}
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {showChat && (
                  <div className="p-4 flex flex-col h-96">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="text-sm">
                          <span className="font-medium">{msg.sender?.username || 'Unknown'}:</span> {msg.message}
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <Button size="sm" onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                )}

                {showParticipants && (
                  <div className="p-4 space-y-2">
                    {allParticipants.map(participant => (
                      <div key={participant.sid} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm">
                          {participant.name || participant.identity}
                          {participant === room?.localParticipant && ' (You)'}
                        </span>
                        <div className="flex space-x-1">
                          <div className={`w-2 h-2 rounded-full ${participant.isMicrophoneEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div className={`w-2 h-2 rounded-full ${participant.isCameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showHostPanel && isHost && (
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Attention Detection</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Enable Detection</span>
                        <button
                          onClick={toggleDetection}
                          className={`w-10 h-6 rounded-full transition-colors ${
                            isAttentionEnabled ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            isAttentionEnabled ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      {isAttentionEnabled && (
                        <div className="text-sm text-gray-600">
                          <p>Your Status: {status}</p>
                          <p>Your Confidence: {Math.round(confidence * 100)}%</p>
                        </div>
                      )}
                    </div>

                    {/* Participant Attention Monitoring */}
                    {isAttentionEnabled && (
                      <div>
                        <h3 className="font-medium mb-2">Participant Attention</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {participants.map(participant => {
                            const attention = participantAttention[participant.sid];
                            return (
                              <div key={participant.sid} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                <span className="font-medium">
                                  {participant.name || participant.identity}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    attention?.status === 'focused' ? 'bg-green-500' : 'bg-red-500'
                                  }`} />
                                  <span className={attention?.status === 'focused' ? 'text-green-600' : 'text-red-600'}>
                                    {attention ? Math.round(attention.confidence * 100) : 0}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {distractedParticipants.length > 0 && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                            <div className="flex items-center space-x-1 mb-1">
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                              <span className="text-xs font-medium text-orange-700">Distracted Users</span>
                            </div>
                            {distractedParticipants.map((participant, index) => (
                              <div key={index} className="text-xs text-orange-600">
                                {participant.name} ({Math.round(participant.confidence * 100)}%)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isAudioEnabled ? 'primary' : 'danger'}
            onClick={toggleAudio}
            className="control-btn"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? 'primary' : 'danger'}
            onClick={toggleVideo}
            className="control-btn"
          >
            {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isScreenSharing ? 'primary' : 'secondary'}
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className="control-btn"
          >
            <Monitor className="h-5 w-5" />
          </Button>
          
          <Button
            variant="secondary"
            onClick={toggleChat}
            className="control-btn"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <Button
            variant="secondary"
            onClick={toggleParticipants}
            className="control-btn"
          >
            <Users className="h-5 w-5" />
          </Button>
          
          <Button
            variant="danger"
            onClick={handleLeaveRoom}
            className="control-btn"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
