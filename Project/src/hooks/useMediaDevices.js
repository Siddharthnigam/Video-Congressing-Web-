import { useState, useEffect } from 'react';

export const useMediaDevices = () => {
  const [devices, setDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: []
  });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        
        setDevices({
          cameras: deviceList.filter(device => device.kind === 'videoinput'),
          microphones: deviceList.filter(device => device.kind === 'audioinput'),
          speakers: deviceList.filter(device => device.kind === 'audiooutput')
        });
      } catch (error) {
        console.error('Error getting media devices:', error);
      }
    };

    getDevices();
  }, []);

  const getMediaStream = async (constraints = { video: true, audio: true }) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error('Error getting media stream:', error);
      throw error;
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  return {
    devices,
    selectedDevices,
    setSelectedDevices,
    stream,
    getMediaStream,
    stopStream
  };
};