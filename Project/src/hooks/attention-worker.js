// attention-worker.js
let faceDetector = null;

self.onmessage = async (event) => {
  const { type, imageBitmap } = event.data;

  if (type === 'init') {
    try {
      if ('FaceDetector' in self) {
        faceDetector = new FaceDetector({ maxDetectedFaces: 1, fastMode: true });
        self.postMessage({ status: 'initialized' });
      } else {
        // Fallback for browsers without FaceDetector API
        self.postMessage({ status: 'no-api' });
      }
    } catch (error) {
      self.postMessage({ status: 'error', error: error.message });
    }
  }

  if (type === 'frame' && imageBitmap) {
    try {
      if (faceDetector) {
        const faces = await faceDetector.detect(imageBitmap);
        
        if (faces.length > 0) {
          const face = faces[0];
          const landmarks = face.landmarks;
          
          // Simple head pose estimation using face landmarks
          const leftEye = landmarks.find(l => l.type === 'eye' && l.locations[0].x < face.boundingBox.x + face.boundingBox.width / 2);
          const rightEye = landmarks.find(l => l.type === 'eye' && l.locations[0].x > face.boundingBox.x + face.boundingBox.width / 2);
          const nose = landmarks.find(l => l.type === 'nose');
          
          if (leftEye && rightEye && nose) {
            const eyeCenter = {
              x: (leftEye.locations[0].x + rightEye.locations[0].x) / 2,
              y: (leftEye.locations[0].y + rightEye.locations[0].y) / 2
            };
            
            // Calculate approximate yaw and pitch
            const yaw = (nose.locations[0].x - eyeCenter.x) / face.boundingBox.width * 100;
            const pitch = (nose.locations[0].y - eyeCenter.y) / face.boundingBox.height * 100;
            
            self.postMessage({
              status: 'face',
              yaw: yaw,
              pitch: pitch,
              confidence: 0.8
            });
          } else {
            // Face detected but no landmarks
            self.postMessage({
              status: 'face',
              yaw: 0,
              pitch: 0,
              confidence: 0.5
            });
          }
        } else {
          self.postMessage({
            status: 'no-face',
            yaw: 0,
            pitch: 0,
            confidence: 0
          });
        }
      } else {
        // Fallback: simple brightness-based detection
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Check center region brightness
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const regionSize = Math.min(canvas.width, canvas.height) * 0.2;
        
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (let y = centerY - regionSize; y < centerY + regionSize; y += 4) {
          for (let x = centerX - regionSize; x < centerX + regionSize; x += 4) {
            if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
              const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
              const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
              totalBrightness += brightness;
              pixelCount++;
            }
          }
        }
        
        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;
        const hasFace = avgBrightness > 60 && avgBrightness < 220;
        
        self.postMessage({
          status: hasFace ? 'face' : 'no-face',
          yaw: 0,
          pitch: 0,
          confidence: hasFace ? 0.6 : 0.2
        });
      }
    } catch (error) {
      self.postMessage({
        status: 'error',
        error: error.message
      });
    }
    
    // Clean up the bitmap
    imageBitmap.close();
  }
};