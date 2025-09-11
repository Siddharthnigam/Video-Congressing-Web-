import { useEffect, useRef, useState, useCallback } from 'react';

export const useAttentionDetection = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState('focused');
  const [confidence, setConfidence] = useState(0.8);
  const [lastChangeAt, setLastChangeAt] = useState(Date.now());

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const previousFrameRef = useRef(null);
  const motionHistoryRef = useRef([]);
  const distractionTimerRef = useRef(null);
  const focusHistoryRef = useRef([]);

  const startDetection = useCallback((videoTrack) => {
    if (!videoTrack || !isEnabled) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
    }

    if (!videoRef.current) {
      videoRef.current = document.createElement('video');
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
    }

    videoTrack.attach(videoRef.current);

    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        
        const imageData = ctx.getImageData(0, 0, 320, 240);
        const motionLevel = calculateMotion(imageData);
        
        detectFacePresence(imageData).then(({ facePresent, brightness, variance, edgeCount, offsetX, offsetY }) => {
          processDetectionResult({ facePresent, brightness, variance, edgeCount, motionLevel, offsetX, offsetY });
        });
      }
    }, 1000 / 5); // Reduced to 5 FPS for less sensitivity
  }, [isEnabled]);
  
  const processDetectionResult = useCallback(({ facePresent, brightness, variance, edgeCount, motionLevel, offsetX, offsetY }) => {
    const now = Date.now();
    
    focusHistoryRef.current.push({ facePresent, motionLevel, timestamp: now });
    if (focusHistoryRef.current.length > 10) { // Longer history
      focusHistoryRef.current.shift();
    }
    
    const recentDetections = focusHistoryRef.current;
    const faceDetectionRate = recentDetections.filter(d => d.facePresent).length / recentDetections.length;
    const avgMotion = recentDetections.reduce((sum, d) => sum + d.motionLevel, 0) / recentDetections.length;
    
    // Very relaxed thresholds
    const isDistracted = faceDetectionRate < 0.1 || avgMotion > 0.12;
    
    if (isDistracted && status === 'focused') {
      if (!distractionTimerRef.current) {
        distractionTimerRef.current = setTimeout(() => {
          setStatus('distracted');
          setConfidence(0.3);
          setLastChangeAt(Date.now());
        }, 10000); // 10 seconds delay
      }
    } else if (!isDistracted) {
      if (distractionTimerRef.current) {
        clearTimeout(distractionTimerRef.current);
        distractionTimerRef.current = null;
      }
      if (status === 'distracted') {
        setStatus('focused');
        setConfidence(0.8);
        setLastChangeAt(now);
      }
    }
  }, [status]);
  
  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (distractionTimerRef.current) {
      clearTimeout(distractionTimerRef.current);
      distractionTimerRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setStatus('focused');
    previousFrameRef.current = null;
    motionHistoryRef.current = [];
    focusHistoryRef.current = [];
  }, []);
  
  const calculateMotion = (imageData) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const currentFrame = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      currentFrame[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    
    if (!previousFrameRef.current) {
      previousFrameRef.current = currentFrame;
      return 0.1;
    }
    
    let totalDiff = 0;
    for (let i = 0; i < currentFrame.length; i += 4) {
      totalDiff += Math.abs(currentFrame[i] - previousFrameRef.current[i]);
    }
    
    previousFrameRef.current = currentFrame;
    return totalDiff / (currentFrame.length / 4) / 255;
  };
  
  const faceDetectorRef = useRef(null);
  
  useEffect(() => {
    if ('FaceDetector' in window) {
      faceDetectorRef.current = new window.FaceDetector({
        maxDetectedFaces: 1,
        fastMode: true
      });
    }
  }, []);
  
  const detectFacePresence = async (imageData) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    try {
      if (faceDetectorRef.current) {
        const faces = await faceDetectorRef.current.detect(canvas);
        
        if (faces.length > 0) {
          const face = faces[0];
          const faceBox = face.boundingBox;
          
          const faceCenterX = faceBox.x + faceBox.width / 2;
          const faceCenterY = faceBox.y + faceBox.height / 2;
          const imageCenterX = width / 2;
          const imageCenterY = height / 2;
          
          const offsetX = Math.abs(faceCenterX - imageCenterX) / width;
          const offsetY = Math.abs(faceCenterY - imageCenterY) / height;
          
          // Much more relaxed - only trigger if very far off-center
          const isLookingAway = offsetX > 0.3 || offsetY > 0.3;
          
          return {
            facePresent: !isLookingAway,
            brightness: 120,
            variance: 100,
            edgeCount: 50,
            offsetX,
            offsetY
          };
        }
      }
    } catch (error) {
      console.log('Face detection not supported, using fallback');
    }
    
    // Fallback with relaxed brightness range
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    const regionSize = Math.min(width, height) * 0.3; // Larger region
    
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let y = centerY - regionSize; y < centerY + regionSize; y += 3) {
      for (let x = centerX - regionSize; x < centerX + regionSize; x += 3) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          totalBrightness += brightness;
          pixelCount++;
        }
      }
    }
    
    const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;
    // Much more relaxed brightness range
    const facePresent = avgBrightness > 40 && avgBrightness < 200;
    
    return {
      facePresent,
      brightness: avgBrightness,
      variance: 0,
      edgeCount: 0
    };
  };
  
  const toggleDetection = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);
  
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);
  
  return {
    isEnabled,
    status,
    confidence,
    lastChangeAt,
    toggleDetection,
    startDetection,
    stopDetection
  };
};
