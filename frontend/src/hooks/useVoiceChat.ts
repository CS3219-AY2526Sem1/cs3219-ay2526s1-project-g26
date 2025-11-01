import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseVoiceChatProps {
  roomId: string;
  enabled: boolean;
  onAudioProcess?: (audioData: Float32Array) => void;
}

export const useVoiceChat = ({ roomId, enabled, onAudioProcess }: UseVoiceChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const remoteAudioNodesRef = useRef<Map<string, MediaStreamAudioDestinationNode>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    // Initialize WebSocket connection
    const socket = io(`${process.env.REACT_APP_COMMUNICATION_SERVICE_URL}/microphone`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    // Handle connection events
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinRoom', roomId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (error: Error) => {
      setError(error.message);
    });

    // Handle room events
    socket.on('roomUsers', (users: string[]) => {
      setParticipants(users);
    });

    socket.on('userJoined', (userId: string) => {
      setParticipants((prev: string[]) => [...prev, userId]);
    });

    socket.on('userLeft', (userId: string) => {
      setParticipants((prev: string[]) => prev.filter((id: string) => id !== userId));
    });

    // Initialize audio context and stream
    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        // Set up audio context
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        // Set up audio processing
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(2048, 1, 1);
        processorRef.current = processor;
        
        source.connect(processor);
        processor.connect(audioContext.destination);
        
        // Process and send audio data
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Call the audio process callback if provided
          if (onAudioProcess) {
            onAudioProcess(inputData);
          }
          
          // Only send audio data if not muted and has sufficient volume
          if (!streamRef.current?.getAudioTracks()[0].enabled) return;
          
          // Calculate volume level
          const volume = Math.sqrt(inputData.reduce((acc, val) => acc + val * val, 0) / inputData.length);
          
          // Only send if there's significant audio (reduces network traffic)
          if (volume > 0.01) {
            // Create a copy of the audio data to send
            const audioToSend = new Float32Array(inputData);
            socket.emit('voiceData', {
              roomId,
              audio: audioToSend.buffer
            });
          }
        };

        // Handle incoming audio data
        socket.on('voiceData', ({ userId, audio }: { userId: string, audio: ArrayBuffer }) => {
          try {
            // Create a buffer for the incoming audio data
            const audioBuffer = audioContext.createBuffer(1, audio.byteLength / 4, audioContext.sampleRate);
            const audioData = new Float32Array(audio);
            audioBuffer.copyToChannel(audioData, 0);

            // Get or create the destination node for this user
            let destinationNode = remoteAudioNodesRef.current.get(userId);
            if (!destinationNode) {
              destinationNode = audioContext.createMediaStreamDestination();
              remoteAudioNodesRef.current.set(userId, destinationNode);
              setRemoteStreams((prev: MediaStream[]) => [...prev, destinationNode.stream]);
            }

            // Create and configure the buffer source
            const bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = audioBuffer;

            // Create a gain node for volume control
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0; // Adjust this value if needed

            // Connect the nodes
            bufferSource.connect(gainNode);
            gainNode.connect(destinationNode);
            gainNode.connect(audioContext.destination);

            // Start playing the buffer
            bufferSource.start(0);

            // Calculate and update volume level
            const volume = Math.sqrt(audioData.reduce((acc, val) => acc + val * val, 0) / audioData.length);
            console.log(`Remote volume from ${userId}:`, volume);
          } catch (error) {
            console.error('Error processing remote audio:', error);
          }
        });
      } catch (err) {
        setError('Failed to access microphone');
        console.error('Microphone access error:', err);
      }
    };

    initializeAudio();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      socket.disconnect();
    };
  }, [roomId, enabled]);

  return {
    isConnected,
    error,
    participants,
    stream: streamRef.current,
    remoteStreams
  };
};