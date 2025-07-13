// Camera utility functions to prevent camera duplication issues

/**
 * Stops all active camera streams to prevent conflicts
 */
export const stopAllCameraStreams = () => {
  try {
    // Get all video elements
    const videoElements = document.querySelectorAll('video');
    
    videoElements.forEach(video => {
      if (video.srcObject) {
        const stream = video.srcObject;
        stream.getTracks().forEach(track => {
          console.log('Stopping camera track:', track.kind);
          track.stop();
        });
        video.srcObject = null;
      }
    });

    // Also try to stop any getUserMedia streams that might be active
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // This is a fallback to ensure all streams are stopped
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => {
            console.log('Stopping fallback camera track:', track.kind);
            track.stop();
          });
        })
        .catch(error => {
          // This is expected if no camera is available
          console.log('No camera streams to stop:', error.message);
        });
    }
  } catch (error) {
    console.error('Error stopping camera streams:', error);
  }
};

/**
 * Checks if there are any active camera streams
 */
export const hasActiveCameraStreams = () => {
  try {
    const videoElements = document.querySelectorAll('video');
    return Array.from(videoElements).some(video => video.srcObject);
  } catch (error) {
    console.error('Error checking camera streams:', error);
    return false;
  }
};

/**
 * Waits for a short delay to ensure camera streams are properly cleaned up
 */
export const waitForCameraCleanup = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Safely initializes camera access with cleanup
 */
export const safeCameraInit = async (options = {}) => {
  try {
    // Stop any existing streams first
    stopAllCameraStreams();
    
    // Wait a bit for cleanup
    await waitForCameraCleanup();
    
    // Request new camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: options.video || true,
      audio: options.audio || false
    });
    
    return stream;
  } catch (error) {
    console.error('Error initializing camera:', error);
    throw error;
  }
}; 