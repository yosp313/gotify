import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, MoreHorizontal, X, Maximize2 } from 'lucide-react'
import { songApi, type Song } from '../services/api'

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  className?: string
}

// Global audio context singleton to avoid multiple contexts
let globalAudioContext: AudioContext | null = null
let audioContextPromise: Promise<AudioContext> | null = null

const getAudioContext = async (): Promise<AudioContext> => {
  if (globalAudioContext && globalAudioContext.state !== 'closed') {
    return globalAudioContext
  }
  
  if (audioContextPromise) {
    return audioContextPromise
  }
  
  audioContextPromise = new Promise((resolve, reject) => {
    try {
      globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      resolve(globalAudioContext)
    } catch (error) {
      reject(error)
    }
  })
  
  return audioContextPromise
}

function AudioVisualizer({ audioRef, isPlaying, className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const analyserRef = useRef<AnalyserNode | undefined>(undefined)
  const dataArrayRef = useRef<Uint8Array | undefined>(undefined)
  const sourceRef = useRef<MediaElementAudioSourceNode | undefined>(undefined)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return

    const audio = audioRef.current

    // Only set up if we have a new audio element
    if (currentAudioRef.current !== audio) {
      const setupAudio = async () => {
        try {
          const audioContext = await getAudioContext()
          
          // Resume audio context if suspended
          if (audioContext.state === 'suspended') {
            await audioContext.resume()
          }
          
          // Clean up previous source if exists
          if (sourceRef.current) {
            try {
              sourceRef.current.disconnect()
            } catch (e) {
              // Ignore disconnection errors
            }
          }
          
          // Check if audio element already has a source node
          let sourceNode = sourceRef.current
          if (!sourceNode) {
            try {
              sourceNode = audioContext.createMediaElementSource(audio)
              sourceRef.current = sourceNode
            } catch (error) {
              console.warn('Could not create media source, audio element may already be connected:', error)
              // Audio will still play without visualization
              currentAudioRef.current = audio
              return
            }
          }
          
          // Create analyser
          analyserRef.current = audioContext.createAnalyser()
          analyserRef.current.fftSize = 256
          
          const bufferLength = analyserRef.current.frequencyBinCount
          dataArrayRef.current = new Uint8Array(bufferLength)
          
          // Connect nodes: source -> analyser -> destination
          sourceNode.connect(analyserRef.current)
          analyserRef.current.connect(audioContext.destination)
          
          currentAudioRef.current = audio
        } catch (error) {
          console.error('Error setting up audio visualization:', error)
          // Ensure audio still works without visualization
          currentAudioRef.current = audio
        }
      }
      
      setupAudio()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioRef])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect()
      }
    }
  }, [])

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current

    try {
      analyser.getByteFrequencyData(dataArray)
    } catch (error) {
      // Audio context might not be ready yet
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawVisualizer)
      }
      return
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const barWidth = canvas.width / dataArray.length * 2.5
    let barHeight
    let x = 0

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#8B5CF6')
    gradient.addColorStop(0.5, '#6366F1')
    gradient.addColorStop(1, '#3B82F6')

    for (let i = 0; i < dataArray.length; i++) {
      barHeight = (dataArray[i] / 255) * canvas.height * 0.8

      ctx.fillStyle = gradient
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

      // Add glow effect
      ctx.shadowColor = '#6366F1'
      ctx.shadowBlur = 10
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
      ctx.shadowBlur = 0

      x += barWidth + 1
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawVisualizer)
    }
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying) {
      // Resume audio context if it's suspended (some browsers require user interaction)
      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().catch(console.error)
      }
      drawVisualizer()
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying, drawVisualizer])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className={`bg-gradient-to-r from-slate-900/20 to-indigo-900/20 rounded-lg ${className}`}
    />
  )
}

interface AdvancedMusicPlayerProps {
  song: Song | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  streamUrl?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function AdvancedMusicPlayer({ 
  song, 
  isPlaying, 
  onPlay, 
  onPause, 
  onClose, 
  onNext, 
  onPrevious,
  streamUrl,
  isMinimized = false,
  onToggleMinimize
}: AdvancedMusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl) return

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime)
      }
    }
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else if (onNext) {
        onNext()
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [streamUrl, onNext, isRepeat, isDragging])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      console.log('Attempting to play audio:', streamUrl)
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        console.log('Audio element state:', {
          paused: audio.paused,
          src: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState
        })
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, streamUrl])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progressBar = progressRef.current
    if (!audio || !progressBar || !duration) return
    
    const rect = progressBar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleProgressClick(e)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    handleProgressClick(e)
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
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
    // Validate song before playing
    if (!song || !songApi.isValidSong(song)) {
      console.error('Cannot play invalid song:', song)
      return
    }

    if (isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  if (!song) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-4 min-w-80 animate-scale-in z-50">
        {streamUrl && (
          <audio
            ref={audioRef}
            src={streamUrl}
            preload="metadata"
            crossOrigin="anonymous"
          />
        )}
        
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <div className="text-white text-xl font-bold">
                {song.title.charAt(0).toUpperCase()}
              </div>
            </div>
            {isPlaying && (
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-25 animate-pulse"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{song.title}</h3>
            <p className="text-gray-600 text-sm truncate">{songApi.getArtistName(song)}</p>
            
            {/* Mini Progress Bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>
            
            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900/95 to-indigo-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-50 animate-slide-up">
      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Song Info & Visualizer */}
          <div className="flex items-center space-x-6 min-w-0 flex-1">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <div className="text-white text-3xl font-bold">
                  {song.title.charAt(0).toUpperCase()}
                </div>
              </div>
              {isPlaying && (
                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-xl truncate">{song.title}</h3>
              <p className="text-indigo-200 text-sm truncate">{songApi.getArtistName(song)}</p>
              
              {/* Audio Visualizer */}
              <div className="mt-3">
                <AudioVisualizer 
                  audioRef={audioRef} 
                  isPlaying={isPlaying}
                  className="w-72 h-16"
                />
              </div>
            </div>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-3 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
              }`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center space-y-4 flex-1 max-w-2xl">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isShuffle 
                    ? 'text-indigo-400 bg-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shuffle className="h-5 w-5" />
              </button>

              <button
                onClick={onPrevious}
                disabled={!onPrevious}
                className="p-3 text-white hover:text-indigo-300 hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipBack className="h-6 w-6" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 shadow-2xl shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </button>

              <button
                onClick={onNext}
                disabled={!onNext}
                className="p-3 text-white hover:text-indigo-300 hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-6 w-6" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isRepeat 
                    ? 'text-indigo-400 bg-indigo-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Repeat className="h-5 w-5" />
              </button>
            </div>

            {/* Timeline/Progress Bar */}
            <div className="w-full flex items-center space-x-4 text-sm text-gray-300">
              <span className="text-xs font-mono">{formatTime(currentTime)}</span>
              <div 
                ref={progressRef}
                className="flex-1 relative h-2 bg-white/20 rounded-full cursor-pointer group"
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
                onMouseMove={handleProgressMouseMove}
                onMouseUp={handleProgressMouseUp}
                onMouseLeave={handleProgressMouseUp}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-150"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
                <div 
                  className="absolute w-4 h-4 bg-white rounded-full shadow-lg top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 8px)` }}
                ></div>
              </div>
              <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
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
                  className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer volume-slider"
                />
              </div>
            </div>

            <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {onToggleMinimize && (
              <button
                onClick={onToggleMinimize}
                className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <Maximize2 className="h-5 w-5 rotate-180" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }
        
        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: linear-gradient(45deg, #6366F1, #8B5CF6);
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
        }
        
        .volume-slider {
          background: linear-gradient(to right, 
            #6366F1 0%, 
            #6366F1 ${isMuted ? 0 : volume * 100}%, 
            rgba(255, 255, 255, 0.2) ${isMuted ? 0 : volume * 100}%, 
            rgba(255, 255, 255, 0.2) 100%);
        }
      `}</style>
    </div>
  )
}
