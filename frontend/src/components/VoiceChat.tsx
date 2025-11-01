import React, { useState, useRef, useEffect } from 'react';
import { IconButton, Box, Typography, Badge, Stack, LinearProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useVoiceChat } from '../hooks/useVoiceChat';

interface VoiceChatProps {
  roomId: string;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ roomId }) => {
  // Initialize state
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [remoteVolume, setRemoteVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const remoteAnalyserRef = useRef<AnalyserNode | null>(null);

  const { isConnected, error, participants, stream, remoteStreams } = useVoiceChat({
    roomId,
    enabled: true,
    onAudioProcess: (audioData) => {
      if (!isMuted) {
        const sum = audioData.reduce((a, b) => a + Math.abs(b), 0);
        const avg = sum / audioData.length;
        const normalizedVolume = Math.min(100, avg * 500);
        setVolume(normalizedVolume);
        setIsSpeaking(normalizedVolume > 5);
      }
    }
  });

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (stream) {
      stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = isMuted;
      });
    }
  };

  useEffect(() => {
    if (remoteStreams.length > 0 && !remoteAnalyserRef.current) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      remoteStreams.forEach((remoteStream: MediaStream) => {
        const source = audioContext.createMediaStreamSource(remoteStream);
        source.connect(analyser);
      });

      remoteAnalyserRef.current = analyser;
      
      const checkVolume = () => {
        if (remoteAnalyserRef.current) {
          const dataArray = new Uint8Array(remoteAnalyserRef.current.frequencyBinCount);
          remoteAnalyserRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const avg = sum / dataArray.length;
          setRemoteVolume(avg);
        }
        requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    }
  }, [remoteStreams]);

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Badge
            color={isConnected ? "success" : "error"}
            variant="dot"
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <IconButton
              onClick={toggleMute}
              color={isMuted ? "error" : (isSpeaking ? "success" : "primary")}
              size="large"
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
          </Badge>

          <LinearProgress 
            variant="determinate" 
            value={volume} 
            sx={{ width: 100, opacity: isMuted ? 0.5 : 1 }} 
          />
          
          <Badge
            color={remoteVolume > 5 ? "success" : "default"}
            variant="dot"
          >
            {remoteVolume > 0 ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </Badge>

          <LinearProgress 
            variant="determinate" 
            value={remoteVolume} 
            sx={{ width: 100 }} 
          />
        </Stack>
        
        <Typography variant="body2" color="text.secondary">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </Typography>

        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};