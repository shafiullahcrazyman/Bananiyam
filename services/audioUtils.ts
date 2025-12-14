export const AudioConstants = {
  INPUT_SAMPLE_RATE: 16000,
  OUTPUT_SAMPLE_RATE: 24000,
};

// --- SETTINGS STATE ---
let sfxVolume = 0.5; // Default 50%
let vibrationIntensity: 'off' | 'light' | 'medium' | 'heavy' = 'medium';

export const setSfxVolume = (vol: number) => {
  sfxVolume = Math.max(0, Math.min(1, vol));
};

export const setVibrationIntensity = (intensity: 'off' | 'light' | 'medium' | 'heavy') => {
  vibrationIntensity = intensity;
};

// --- GAME SOUND EFFECTS ENGINE (Synthesized) ---

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

// Helper for haptics with intensity scaling
const vibrate = (pattern: number | number[]) => {
  if (!navigator.vibrate || vibrationIntensity === 'off') return;

  let multiplier = 1;
  if (vibrationIntensity === 'light') multiplier = 0.5;
  if (vibrationIntensity === 'heavy') multiplier = 1.5;

  const scaledPattern = Array.isArray(pattern) 
    ? pattern.map(p => p * multiplier)
    : (pattern as number) * multiplier;

  navigator.vibrate(scaledPattern);
};

export const GameAudio = {
  playTone: (freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) => {
    if (sfxVolume <= 0) return; // Mute check

    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    // Apply Master SFX Volume
    const effectiveVol = vol * sfxVolume;

    gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(effectiveVol, audioCtx.currentTime + delay + 0.02); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration); // Fast decay
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
  },

  playClick: () => {
    // Soft wooden click
    GameAudio.playTone(600, 'sine', 0.05, 0, 0.05);
    vibrate(10); // Light tap
  },

  playCorrect: () => {
    // Duolingo-style: Crisp, bright "Ding-Ding"
    // High pitched sine waves, very short duration
    GameAudio.playTone(1000, 'sine', 0.15, 0, 0.1);    // High C
    GameAudio.playTone(1500, 'sine', 0.25, 0.08, 0.1); // High G (Perfect 5th up)
    vibrate(50); // Solid bump
  },

  playIncorrect: () => {
    // Duolingo-style: Dull, soft "Thud"
    // Lower pitched triangle/sine, slightly descending
    GameAudio.playTone(300, 'triangle', 0.2, 0, 0.1);
    GameAudio.playTone(250, 'triangle', 0.2, 0.05, 0.1);
    vibrate([30, 50, 30]); // Double bump (shake feel)
  },

  playWin: () => {
    // Bright Fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio
    notes.forEach((note, i) => {
        GameAudio.playTone(note, 'sine', 0.3, i * 0.08, 0.1);
    });
    GameAudio.playTone(1046.50, 'sine', 0.6, 0.32, 0.1);
    GameAudio.playTone(1318.51, 'sine', 0.8, 0.4, 0.1);
    vibrate([50, 50, 50, 50, 100]); // Pattern
  },
  
  playLevelUp: () => {
     // Magical shimmer
     const now = 0;
     GameAudio.playTone(800, 'sine', 0.1, 0, 0.05);
     GameAudio.playTone(1200, 'sine', 0.1, 0.05, 0.05);
     GameAudio.playTone(1600, 'sine', 0.1, 0.10, 0.05);
     GameAudio.playTone(2000, 'sine', 0.3, 0.15, 0.05);
     vibrate([20, 20, 20, 20, 50]);
  },
  
  playTick: () => {
      GameAudio.playTone(800, 'sine', 0.05, 0, 0.02);
      vibrate(5);
  }
};


// --- EXISTING UTILS ---

export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = AudioConstants.OUTPUT_SAMPLE_RATE,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp values to [-1, 1] before converting to PCM16
    const sample = Math.max(-1, Math.min(1, data[i]));
    int16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
  }
  return {
    data: arrayBufferToBase64(int16.buffer),
    mimeType: `audio/pcm;rate=${AudioConstants.INPUT_SAMPLE_RATE}`,
  };
}