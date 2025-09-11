// attention-worker.js
importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
importScripts('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

let faceMesh;

onmessage = async (event) => {
  const { type, imageBitmap } = event.data;

  if (type === 'init') {
    faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        postMessage({ status: 'no-face' });
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];

      // Estimate yaw/pitch using key landmarks
      const noseTip = landmarks[1];
      const leftCheek = landmarks[234];
      const rightCheek = landmarks[454];

      const dx = rightCheek.x - leftCheek.x;
      const dy = noseTip.y - (leftCheek.y + rightCheek.y) / 2;

      const yaw = Math.atan2(dx, 0.1) * (180 / Math.PI);
      const pitch = Math.atan2(dy, 0.1) * (180 / Math.PI);

      postMessage({ status: 'face', yaw, pitch });
    });

    postMessage({ status: 'ready' });
  }

  if (type === 'frame' && imageBitmap) {
    await faceMesh.send({ image: imageBitmap });
  }
};