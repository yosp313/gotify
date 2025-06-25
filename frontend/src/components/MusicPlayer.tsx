import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, MoreHorizontal, X } from 'lucide-react'
import type { Song } from '../services/api'

interface MusicPlayerProps {
  song: Song | null
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  streamUrl?: string
}

export function MusicPlayer({ 
  song, 
  isPlaying, 
  onPlay, 
  onPause, 
  onClose, 
  onNext, 
  onPrevious,
  streamUrl 
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !streamUrl || !song) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    
    const handleError = (error: Event) => {
      console.error('Audio playback error:', error)
      onPause() // Stop playback on error
    }

    const handleEnded = () => {
      if (onNext) {
        onNext()
      }
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [streamUrl, onNext, song, onPause])

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
    if (!audio || !streamUrl || !song) return

    // Validate song ID before attempting to play
    if (!song.id || song.id === '00000000-0000-0000-0000-000000000000') {
      console.error('Cannot play song with invalid ID:', song.id)
      return
    }

    if (isPlaying) {
      audio.pause()
      onPause()
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error)
        onPause() // Ensure UI reflects failed play state
      })
      onPlay()
    }
  }

  if (!song) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl z-50 animate-slide-up">
      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          autoPlay={isPlaying}
        />
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
              <p className="text-gray-600 text-sm truncate">Artist ID: {song.artist_id.slice(0, 8)}...</p>
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

          {/* Controls */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            <div className="flex items-center space-x-4">
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
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </button>

              <button
                onClick={onNext}
                disabled={!onNext}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-5 w-5" />
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

            {/* Progress Bar */}
            <div className="w-full flex items-center space-x-3 text-sm text-gray-500">
              <span className="text-xs">{formatTime(currentTime)}</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={duration ? (currentTime / duration) * 100 : 0}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB ${duration ? (currentTime / duration) * 100 : 0}%, #E5E7EB 100%)`
                  }}
                />
              </div>
              <span className="text-xs">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume & Actions */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${isMuted ? 0 : volume * 100}%, #E5E7EB ${isMuted ? 0 : volume * 100}%, #E5E7EB 100%)`
                }}
              />
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
          width: 16px;
          height: 16px;
          background: #4F46E5;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #4F46E5;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
