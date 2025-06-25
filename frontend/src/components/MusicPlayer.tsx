import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, MoreHorizontal, X } from 'lucide-react'
import { songApi, type Song } from '../services/api'

interface MusicPlayerProps {
  song: Song | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
}

export function MusicPlayer({ 
  song, 
  isPlaying, 
  onPlay, 
  onPause, 
  onClose, 
  onNext, 
  onPrevious
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isVisualizerActive, setIsVisualizerActive] = useState(false)
  const [authenticatedStreamUrl, setAuthenticatedStreamUrl] = useState<string | null>(null)
  const [streamError, setStreamError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize audio context and analyser for visualizer
  const initializeAudioContext = () => {
    if (!audioRef.current || audioContextRef.current) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.current)
      
      analyser.fftSize = 128
      // frequencyBinCount is read-only, it's automatically set to fftSize / 2
      
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source
      setIsVisualizerActive(true)
    } catch (error) {
      console.error('Error initializing audio context:', error)
    }
  }

  // Audio visualizer animation
  const drawVisualizer = () => {
    if (!analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw bars
    const barWidth = canvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
      
      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight)
      gradient.addColorStop(0, '#4F46E5')
      gradient.addColorStop(0.5, '#7C3AED')
      gradient.addColorStop(1, '#EC4899')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight)
      
      x += barWidth
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawVisualizer)
    }
  }

  // Load authenticated stream URL when song changes
  useEffect(() => {
    if (!song) {
      setAuthenticatedStreamUrl(null)
      setStreamError(null)
      return
    }

    const loadStream = async () => {
      try {
        setStreamError(null)
        // Use authenticated stream URL with proper authorization headers
        const streamUrl = await songApi.getAuthenticatedStreamUrl(song.id)
        setAuthenticatedStreamUrl(streamUrl)
      } catch (error) {
        console.error('Failed to load authenticated stream:', error)
        setStreamError('Failed to load audio stream')
        setAuthenticatedStreamUrl(null)
      }
    }

    loadStream()
  }, [song])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !authenticatedStreamUrl || !song) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    const handleError = (error: Event) => {
      console.error('Audio playback error:', error)
      setStreamError('Audio playback failed')
      onPause() // Stop playback on error
    }

    const handleEnded = () => {
      if (onNext) {
        onNext()
      }
    }

    const handlePlay = () => {
      initializeAudioContext()
      drawVisualizer()
    }

    const handlePause = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [authenticatedStreamUrl, onNext, song, onPause, isPlaying])

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    
    const newTime = (parseFloat(e.target.value) / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100
    setVolume(newVolume)
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !authenticatedStreamUrl || !song) return

    // Validate song ID before attempting to play
    if (!song.id || !songApi.isValidSong(song)) {
      console.error('Cannot play song with invalid data:', song)
      return
    }

    if (isPlaying) {
      audio.pause()
      onPause()
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        setStreamError('Failed to play audio')
        onPause() // Ensure UI reflects failed play state
      })
      onPlay()
    }
  }

  if (!song) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50 animate-slide-up">
      {authenticatedStreamUrl && (
        <audio
          ref={audioRef}
          src={authenticatedStreamUrl}
          autoPlay={isPlaying}
          crossOrigin="anonymous"
        />
      )}
      
      {/* Audio Visualizer */}
      {isVisualizerActive && (
        <div className="h-16 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={64}
            className="w-full h-full opacity-80"
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white text-2xl font-bold">
                  {song.title.charAt(0).toUpperCase()}
                </div>
              </div>
              {isPlaying && (
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-50 animate-pulse"></div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate text-lg">{song.title}</h3>
              <p className="text-gray-600 text-sm truncate">{songApi.getArtistName(song)}</p>
              {streamError && (
                <p className="text-red-500 text-xs truncate mt-1">{streamError}</p>
              )}
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Enhanced Controls */}
          <div className="flex flex-col items-center space-y-3 flex-1 max-w-md">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isShuffle 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Shuffle className="h-4 w-4" />
              </button>

              <button
                onClick={onPrevious}
                disabled={!onPrevious}
                className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              {/* Enhanced Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="group relative p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-indigo-500/30 transition-all duration-200 transform hover:scale-110 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative">
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" />
                  )}
                </div>
              </button>

              <button
                onClick={onNext}
                disabled={!onNext}
                className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-6 w-6" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isRepeat 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Repeat className="h-4 w-4" />
              </button>
            </div>

            {/* Enhanced Progress Bar with Timeline */}
            <div className="w-full flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative group">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer slider shadow-inner"
                    style={{
                      background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB 100%)`
                    }}
                  />
                  {/* Progress Indicator */}
                  <div 
                    className="absolute top-1/2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full shadow-lg pointer-events-none transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 0.5rem)`
                    }}
                  ></div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div className="relative group">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${isMuted ? 0 : volume * 100}%, #E5E7EB ${isMuted ? 0 : volume * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div 
                  className="absolute top-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md pointer-events-none transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    left: `calc(${isMuted ? 0 : volume * 100}% - 0.375rem)`
                  }}
                ></div>
              </div>
            </div>

            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all">
              <MoreHorizontal className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          width: 22px;
          height: 22px;
          box-shadow: 0 6px 12px rgba(79, 70, 229, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          width: 22px;
          height: 22px;
          box-shadow: 0 6px 12px rgba(79, 70, 229, 0.4);
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        @media (max-width: 768px) {
          .slider::-webkit-slider-thumb {
            width: 18px;
            height: 18px;
          }
          
          .slider::-webkit-slider-thumb:hover {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  )
}
