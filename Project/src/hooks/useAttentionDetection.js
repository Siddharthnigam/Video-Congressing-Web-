import { useState, useEffect, useRef } from 'react';

export const useAttentionDetection = () => {
  const [isAttentionEnabled, setIsAttentionEnabled] = useState(false);
  const [attentionStats, setAttentionStats] = useState({
    totalTime: 0,
    focusedTime: 0,
    attentionScore: 100
  });
  const [showAttentionWarning, setShowAttentionWarning] = useState(false);
  
  const detectionInterval = useRef(null);

  useEffect(() => {
    if (isAttentionEnabled) {
      // Simulate ML attention detection
      detectionInterval.current = setInterval(() => {
        // Mock detection logic - in real app, this would use ML model
        const isUserFocused = Math.random() > 0.3; // 70% chance user is focused
        
        if (!isUserFocused && !showAttentionWarning) {
          setShowAttentionWarning(true);
        }
        
        setAttentionStats(prev => ({
          totalTime: prev.totalTime + 1,
          focusedTime: prev.focusedTime + (isUserFocused ? 1 : 0),
          attentionScore: Math.round(((prev.focusedTime + (isUserFocused ? 1 : 0)) / (prev.totalTime + 1)) * 100)
        }));
      }, 5000); // Check every 5 seconds
    } else {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [isAttentionEnabled, showAttentionWarning]);

  const toggleAttentionDetection = () => {
    setIsAttentionEnabled(!isAttentionEnabled);
  };

  const dismissAttentionWarning = () => {
    setShowAttentionWarning(false);
  };

  const resetStats = () => {
    setAttentionStats({
      totalTime: 0,
      focusedTime: 0,
      attentionScore: 100
    });
  };

  return {
    isAttentionEnabled,
    attentionStats,
    showAttentionWarning,
    toggleAttentionDetection,
    dismissAttentionWarning,
    resetStats
  };
};