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
    // 1. If not enabled, do nothing.
    // We return a simple cleanup in case enabled toggled from true->false.
    if (!enabled) {
      // Return a cleanup to be safe, though refs are likely null
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }
    }

    // --- This flag is the main fix ---
    // 2. Add a flag to track if the component is still mounted.
    let isMounted = true

    // Initialize WebSocket connection
    const socket = io(`/microphone`, {
      path: `${API_ENDPOINTS.COMMUNICATION}/socket.io`,
      // ... (rest of socket config)
    })

    socketRef.current = socket

    // ... (socket connection events are the same) ...
    socket.on('connect', () => {
      if (!isMounted) return // Check if still mounted
      setIsConnected(true)
      socket.emit('joinRoom', roomId)
    })

    socket.on('disconnect', () => setIsConnected(false)) // No harm if unmounted

    socket.on('error', (error: Error) => {
      if (!isMounted) return
      setError(error.message)
    })

    socket.on('roomUsers', (users: string[]) => {
      if (!isMounted) return
      setParticipants(users)
    })

    socket.on('userJoined', (userId: string) => {
      if (!isMounted) return
      setParticipants((prev: string[]) => [...prev, userId])
    })

    socket.on('userLeft', (userId: string) => {
      if (!isMounted) return
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

        // Check if component unmounted while we were awaiting permission
        if (!isMounted) {
          // If so, stop the stream we just got and abort setup.
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
          return
        }

        // If we are still mounted, store the stream
        streamRef.current = stream

        // Set up audio context
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const masterGain = audioContext.createGain()
        masterGain.gain.value = 1.0
        masterGain.connect(audioContext.destination)
        masterGainNodeRef.current = masterGain

        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(2048, 1, 1)
        processorRef.current = processor

        source.connect(processor)
        processor.connect(audioContext.destination)

        processor.onaudioprocess = (e) => {
          // ... (same as before, no changes needed here) ...
          const inputData = e.inputBuffer.getChannelData(0)

          if (onAudioProcess) {
            onAudioProcess(inputData)
          }

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
            // Check for unmount or closed context
            if (
              !isMounted ||
              !audioContextRef.current ||
              audioContextRef.current.state === 'closed'
            )
              return

            try {
              // ... (same as before, no changes needed here) ...
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

                // Check mount status before setting state
                if (isMounted) {
                  setRemoteStreams((prev: MediaStream[]) => [
                    ...prev,
                    destinationNode!.stream,
                  ])
                }
              }

              const bufferSource = audioContextRef.current.createBufferSource()
              bufferSource.buffer = audioBuffer

              const gainNode = audioContextRef.current.createGain()
              gainNode.gain.value = 1.0

              bufferSource.connect(gainNode)
              gainNode.connect(destinationNode)
              gainNode.connect(masterGainNodeRef.current)
              bufferSource.start(0)
            } catch (error) {
              console.error('Error processing remote audio:', error)
            }
          }
        )
      } catch (err) {
        if (isMounted) {
          // Only set error if still mounted
          setError('Failed to access microphone')
          console.error('Microphone access error:', err)
        }
      }
    }

    initializeAudio()

    // Cleanup
    return () => {
      // 4. Set the flag to false on unmount
      isMounted = false

      // 5. Improved cleanup
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track: MediaStreamTrack) => track.stop())
        streamRef.current = null
      }

      // Disconnect all audio nodes
      if (processorRef.current) {
        processorRef.current.disconnect()
        processorRef.current = null
      }
      if (masterGainNodeRef.current) {
        masterGainNodeRef.current.disconnect()
        masterGainNodeRef.current = null
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      // Disconnect socket (this was correct)
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId, enabled, onAudioProcess]) // Dependency array is correct

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
