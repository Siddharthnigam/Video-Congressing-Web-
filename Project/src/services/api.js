const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  createRoom: async (hostName, roomName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          host_name: hostName,
          name: roomName,
          timestamp: Date.now()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API createRoom response:', data);
      return data;
    } catch (error) {
      console.error('API createRoom error:', error);
      throw error;
    }
  },

  joinRoom: async (roomId, name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API joinRoom response:', data);
      return data;
    } catch (error) {
      console.error('API joinRoom error:', error);
      throw error;
    }
  },

  getParticipants: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/participants/`);
    return response.json();
  },

  sendMessage: async (roomId, sender, message) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages/send/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender, message }),
    });
    return response.json();
  },

  getMessages: async (roomId) => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages/`);
    return response.json();
  }
};