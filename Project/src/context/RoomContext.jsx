import { createContext, useContext, useState } from 'react';

const RoomContext = createContext();

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [roomId, setRoomId] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [livekitToken, setLivekitToken] = useState(null);
  const [userName, setUserName] = useState('');

  const joinRoom = (id, name, hostStatus = false, url = null, token = null) => {
    setRoomId(id);
    setRoomName(name);
    setIsHost(hostStatus);
    setUserName(name);
    setLivekitUrl(url);
    setLivekitToken(token);
  };

  const leaveRoom = () => {
    setRoomId(null);
    setRoomName('');
    setIsHost(false);
    setParticipants([]);
    setChatMessages([]);
  };

  const addChatMessage = (message) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      ...message,
      timestamp: new Date()
    }]);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  const value = {
    roomId,
    roomName,
    isHost,
    participants,
    setParticipants,
    chatMessages,
    showChat,
    showParticipants,
    livekitUrl,
    livekitToken,
    userName,
    joinRoom,
    leaveRoom,
    addChatMessage,
    toggleChat,
    toggleParticipants
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};