// VoiceChat.tsx
import { useEffect, useRef, useState, useCallback } from 'react' // Import useCallback
import { io, Socket } from 'socket.io-client'
import { API_ENDPOINTS } from '../constants/api'

interface UseVoiceChatProps {
  roomId: string
  enabled: boolean
  onAudioProcess?: (audioData: Float32Array) => void
}

// Define the hook's return type for clarity
export interface UseVoiceChatReturn {
  isConnected: boolean
  error: string | null
  participants: string[]
  stream: MediaStream | null
  remoteStreams: MediaStream[]
  toggleMute: (isMuted: boolean) => void
  toggleSilence: (isSilent: boolean) => void
}

export const useVoiceChat = ({
  roomId,
  enabled,
  onAudioProcess,
}: UseVoiceChatProps): UseVoiceChatReturn => {
  // Add return type
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [participants, setParticipants] = useState<string[]>([])
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])

  const socketRef = useRef<Socket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  // const gainNodeRef = useRef<GainNode | null>(null) // No longer needed for individual control
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const remoteAudioNodesRef = useRef<
    Map<string, MediaStreamAudioDestinationNode>
  >(new Map())

  // **NEW**: Ref for the master gain node to control all incoming audio
  const masterGainNodeRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Initialize WebSocket connection
    const socket = io(`/microphone`, {
      path: `${API_ENDPOINTS.COMMUNICATION}/socket.io`,
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socketRef.current = socket

    // ... socket connection events (connect, disconnect, error) ...
    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('joinRoom', roomId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('error', (error: Error) => {
      setError(error.message)
    })

    // ... socket room events (roomUsers, userJoined, userLeft) ...
    socket.on('roomUsers', (users: string[]) => {
      setParticipants(users)
    })

    socket.on('userJoined', (userId: string) => {
      setParticipants((prev: string[]) => [...prev, userId])
    })

    socket.on('userLeft', (userId: string) => {
      setParticipants((prev: string[]) =>
        prev.filter((id: string) => id !== userId)
      )
    })

    // Initialize audio context and stream
    const initializeAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        })
        streamRef.current = stream

        // Set up audio context
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        // **NEW**: Create and connect the master gain node
        const masterGain = audioContext.createGain()
        masterGain.gain.value = 1.0 // 1.0 = full volume (not silent)
        masterGain.connect(audioContext.destination)
        masterGainNodeRef.current = masterGain

        // Set up audio processing
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(2048, 1, 1)
        processorRef.current = processor

        source.connect(processor)
        processor.connect(audioContext.destination) // Connect processor to destination (for local processing)

        // Process and send audio data
        processor.onaudioprocess = (e) => {
          // ... (same as before)
          const inputData = e.inputBuffer.getChannelData(0)

          if (onAudioProcess) {
            onAudioProcess(inputData)
          }

          // Check if the local track is enabled (not muted)
          if (!streamRef.current?.getAudioTracks()[0].enabled) return

          const volume = Math.sqrt(
            inputData.reduce((acc, val) => acc + val * val, 0) /
              inputData.length
          )

          if (volume > 0.01) {
            const audioToSend = new Float32Array(inputData)
            socket.emit('voiceData', {
              roomId,
              audio: audioToSend.buffer,
            })
          }
        }

        // Handle incoming audio data
        socket.on(
          'voiceData',
          ({ userId, audio }: { userId: string; audio: ArrayBuffer }) => {
            try {
              if (!audioContextRef.current || !masterGainNodeRef.current) return

              const audioBuffer = audioContextRef.current.createBuffer(
                1,
                audio.byteLength / 4,
                audioContextRef.current.sampleRate
              )
              const audioData = new Float32Array(audio)
              audioBuffer.copyToChannel(audioData, 0)

              let destinationNode = remoteAudioNodesRef.current.get(userId)
              if (!destinationNode) {
                destinationNode =
                  audioContextRef.current.createMediaStreamDestination()
                remoteAudioNodesRef.current.set(userId, destinationNode)
                setRemoteStreams((prev: MediaStream[]) => [
                  ...prev,
                  destinationNode!.stream,
                ])
              }

              const bufferSource = audioContextRef.current.createBufferSource()
              bufferSource.buffer = audioBuffer

              const gainNode = audioContextRef.current.createGain()
              gainNode.gain.value = 1.0

              bufferSource.connect(gainNode)
              gainNode.connect(destinationNode)

              // **MODIFIED**: Connect to the master gain node, NOT the main destination
              gainNode.connect(masterGainNodeRef.current)

              bufferSource.start(0)

              // ... (volume logging)
            } catch (error) {
              console.error('Error processing remote audio:', error)
            }
          }
        )
      } catch (err) {
        setError('Failed to access microphone')
        console.error('Microphone access error:', err)
      }
    }

    initializeAudio()

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      socket.disconnect()
    }
  }, [roomId, enabled, onAudioProcess]) // Added onAudioProcess to dependency array

  // **NEW**: Function to toggle the local microphone
  const toggleMute = useCallback((isMuted: boolean) => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted // true = unmuted, false = muted
      })
    }
  }, []) // Empty dependency array, as streamRef is a ref

  // **NEW**: Function to silence all incoming audio
  const toggleSilence = useCallback((isSilent: boolean) => {
    if (masterGainNodeRef.current) {
      masterGainNodeRef.current.gain.value = isSilent ? 0.0 : 1.0
    }
  }, []) // Empty dependency array, as masterGainNodeRef is a ref

  return {
    isConnected,
    error,
    participants,
    stream: streamRef.current,
    remoteStreams,
    toggleMute, // **NEW**: Expose the function
    toggleSilence, // **NEW**: Expose the function
  }
}
