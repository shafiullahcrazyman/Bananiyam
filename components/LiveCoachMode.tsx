import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Radio, Volume2 } from 'lucide-react';
import { connectLiveSession } from '../services/geminiService';
import { createPcmBlob, decodeAudioData, AudioConstants } from '../services/audioUtils';
import AudioVisualizer from './AudioVisualizer';

const LiveCoachMode: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState<string>("");
  
  // Refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Session promise storage to prevent race conditions
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    startSession();

    // Cleanup on unmount
    return () => {
      stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = async () => {
    try {
      // 1. Setup Audio Contexts
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: AudioConstants.OUTPUT_SAMPLE_RATE
      });

      // 2. Setup Analysers for Visualization
      const inputAnalyser = audioContextRef.current.createAnalyser();
      inputAnalyser.fftSize = 256;
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = audioContextRef.current.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyserRef.current = outputAnalyser;

      // 3. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: AudioConstants.INPUT_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true 
        } 
      });
      streamRef.current = stream;

      // 4. Connect Microphone to Processing
      const source = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(inputAnalyser); // Connect to visualizer

      // Processor for capturing raw PCM
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      // 5. Connect to Gemini Live API
      sessionPromiseRef.current = connectLiveSession(
        () => {
          console.log("Live Session Open");
          setIsConnected(true);
        },
        async ({ audioData, text, turnComplete }) => {
          if (turnComplete) {
            // Can handle turn complete logic here
          }

          if (audioData && audioContextRef.current && outputAnalyserRef.current) {
            // Decode and Play Audio from Model
            const rawBytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
            const audioBuffer = await decodeAudioData(rawBytes, audioContextRef.current);
            
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAnalyserRef.current);
            outputAnalyserRef.current.connect(audioContextRef.current.destination);
            
            const currentTime = audioContextRef.current.currentTime;
            // Ensure gapless playback
            const startTime = Math.max(nextStartTimeRef.current, currentTime);
            source.start(startTime);
            nextStartTimeRef.current = startTime + audioBuffer.duration;
          }
        },
        () => {
          console.log("Session Closed");
          setIsConnected(false);
        },
        (err) => {
          console.error("Session Error", err);
          setIsConnected(false);
        }
      );

      // 6. Send Audio Data to Model
      processor.onaudioprocess = (e) => {
        if (!isMicOn) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);

        sessionPromiseRef.current?.then(session => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

    } catch (err) {
      console.error("Failed to start live session:", err);
    }
  };

  const stopSession = () => {
    // Close Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect Audio Nodes
    sourceRef.current?.disconnect();
    processorRef.current?.disconnect();
    
    // Close Context
    audioContextRef.current?.close();

    // Reset Refs
    streamRef.current = null;
    audioContextRef.current = null;
    sessionPromiseRef.current = null;
    setIsConnected(false);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in h-full flex flex-col items-center">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
          <Radio size={14} className="animate-pulse" /> Live API
        </span>
        <h2 className="text-3xl font-bold text-slate-800">Coach Mode</h2>
        <p className="text-slate-500 mt-2">Have a conversation to practice your spelling.</p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-purple-100 border border-purple-50 relative overflow-hidden flex flex-col items-center gap-8">
        
        {/* Status Indicator */}
        <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-red-300'}`} />

        {/* Visualizers */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-2">
            <span>Gemini (Voice)</span>
          </div>
          <AudioVisualizer analyser={outputAnalyserRef.current} isActive={isConnected} color="#8b5cf6" />
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-medium px-2">
             <span>You (Mic)</span>
          </div>
          <AudioVisualizer analyser={inputAnalyserRef.current} isActive={isMicOn && isConnected} color="#0ea5e9" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          <button 
            onClick={toggleMic}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isMicOn 
                ? 'bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700 scale-100' 
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {isMicOn ? <Mic size={32} /> : <MicOff size={32} />}
          </button>
        </div>

        <p className="text-center text-slate-400 text-sm max-w-xs">
          {isConnected 
            ? "Say \"Give me a word\" to start practicing!" 
            : "Connecting to coach..."}
        </p>
      </div>
    </div>
  );
};

export default LiveCoachMode;
