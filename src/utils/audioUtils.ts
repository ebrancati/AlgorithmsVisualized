let audioContextInstance: AudioContext | null = null;

/**
 * Gets an AudioContext instance, creating it if it doesn't exist
 * Also handles compatibility with older browsers
 */
export const getAudioContext = (): AudioContext => {
  if (!audioContextInstance) {
    // Check for standard API support or prefixed version
    if (window.AudioContext) {
      audioContextInstance = new AudioContext();
    } else if ('webkitAudioContext' in window) {
      const ctx = new (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext();
      audioContextInstance = ctx;
    } else {
      throw new Error("AudioContext not supported in this browser");
    }
  }
  
  return audioContextInstance;
};

/**
 * Plays a sound for sorting/visualization algorithms
 * @param barHeight - Height of the bar (affects frequency)
 * @param intensity - Sound intensity (0-100)
 * @param isMuted - Flag to completely disable audio
 */
export const playAlgorithmSound = (barHeight: number, intensity: number, isMuted: boolean): void => {
  if (isMuted) {
    return;
  }
  
  try {
    const audioContext = getAudioContext();
    
    // Calculate frequency based on bar height
    const frequency = 400 + (barHeight / 310) * 800;
    
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Create a gain node to control volume
    const gainNode = audioContext.createGain();
    
    // Normalize intensity (0-100) to a range between 0 and 1
    const normalizedIntensity = Math.min(1, Math.max(0, intensity / 100));
    
    // Calculate volume based on intensity
    const volume = 0.1 * normalizedIntensity;
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.1);
    
    // Connect oscillator to gain and then to output
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
  
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Error playing algorithm sound:", error);
  }
};

/**
 * Plays a sound for fractal visualization
 * @param depth - Depth of the fractal
 */
export const playFractalSound = (depth: number): void => {
  try {
    const audioContext = getAudioContext();

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';

    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;

    // Add a biquad filter for some tonal character
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    filter.Q.value = 5;

    // Connect nodes
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Calculate base frequency based on depth
    const baseFreq = 180; // Lower base frequency
    const frequency = baseFreq * (1 + depth * 0.2); // Linear increase with depth

    oscillator.frequency.value = frequency;

    // Sound volume control over time
    const now = audioContext.currentTime;

    gainNode.gain.setValueAtTime(0, now); // Start silent
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01); // Rise to peak
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.2); // First decrease
    gainNode.gain.linearRampToValueAtTime(0.09, now + 0.3); // Second decrease
    gainNode.gain.linearRampToValueAtTime(0, now + 0.6); // Fade out

    oscillator.start(now);
    oscillator.stop(now + 0.6);
  } catch (error) {
    console.error("Error playing fractal sound:", error);
  }
};