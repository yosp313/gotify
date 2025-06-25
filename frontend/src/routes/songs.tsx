import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Music, Play, Search, Filter, Waves, Headphones, Clock, User, Heart, MoreHorizontal, Pause, Volume2 } from 'lucide-react'
import { songApi } from '../services/api'
import { AdvancedMusicPlayer } from '../components/AdvancedMusicPlayer'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { Song } from '../services/api'

export const Route = createFileRoute('/songs')({
  component: SongsPage,
})

function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [selectedArtist, setSelectedArtist] = useState<string>('')
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false)

  // Helper function to get artist name
  const getArtistName = (song: Song) => {
    return songApi.getArtistName(song)
  }

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const allSongs = await songApi.getAll()
        // Filter out songs with invalid data
        const validSongs = allSongs.filter(songApi.isValidSong)
        
        if (validSongs.length !== allSongs.length) {
          console.warn(`Filtered out ${allSongs.length - validSongs.length} songs with invalid data`)
        }
        
        setSongs(validSongs)
        setFilteredSongs(validSongs)
      } catch (error) {
        console.error('Error fetching songs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [])

  useEffect(() => {
    let filtered = songs

    if (searchQuery.trim()) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedArtist) {
      filtered = filtered.filter(song => 
        song.artist?.full_name?.toLowerCase().includes(selectedArtist.toLowerCase()) ||
        song.artist_id === selectedArtist
      )
    }

    setFilteredSongs(filtered)
  }, [searchQuery, selectedArtist, songs])

  const playAudio = (songId: string) => {
    const song = songs.find(s => s.id === songId)
    if (!song || !songApi.isValidSong(song)) {
      console.error('Invalid song or song not found:', songId)
      return
    }

    setCurrentSong(song)
    setPlayingSongId(songId)
  }

  const stopAudio = () => {
    setPlayingSongId(null)
    setCurrentSong(null)
  }

  const handlePlayPause = () => {
    if (playingSongId) {
      setPlayingSongId(null)
    } else if (currentSong) {
      setPlayingSongId(currentSong.id)
    }
  }

  const handleNext = () => {
    if (!currentSong) return
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % filteredSongs.length
    const nextSong = filteredSongs[nextIndex]
    if (nextSong) {
      setCurrentSong(nextSong)
      setPlayingSongId(nextSong.id)
    }
  }

  const handlePrevious = () => {
    if (!currentSong) return
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + filteredSongs.length) % filteredSongs.length
    const prevSong = filteredSongs[prevIndex]
    if (prevSong) {
      setCurrentSong(prevSong)
      setPlayingSongId(prevSong.id)
    }
  }

  const handleClose = () => {
    setCurrentSong(null)
    setPlayingSongId(null)
  }

  const toggleLike = (songId: string) => {
    const newLikedSongs = new Set(likedSongs)
    if (likedSongs.has(songId)) {
      newLikedSongs.delete(songId)
    } else {
      newLikedSongs.add(songId)
    }
    setLikedSongs(newLikedSongs)
  }

  const uniqueArtists = Array.from(
    new Set(
      songs
        .filter(song => song.artist?.full_name) // Only include songs with artist data
        .map(song => song.artist!.full_name)
    )
  )

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your music library..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Your Music Library
          </h1>
          <p className="text-gray-600 mt-2">Discover and play your favorite songs</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200">
            <Waves className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{filteredSongs.length} songs</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="bg-current h-0.5 rounded-full"></div>
                <div className="bg-current h-0.5 rounded-full"></div>
                <div className="bg-current h-0.5 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search songs by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
              >
                <option value="">All Artists</option>
                {uniqueArtists.map((artistName) => (
                  <option key={artistName} value={artistName}>
                    {artistName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 font-medium">
            <Headphones className="h-5 w-5" />
            <span>Play All</span>
          </button>
        </div>
      </div>

      {/* Songs Display */}
      {filteredSongs.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 card-hover border border-gray-100 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        {playingSongId === song.id && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-50 animate-pulse"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(song.id)}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          likedSongs.has(song.id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedSongs.has(song.id) ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors truncate">
                      {song.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                      <User className="h-3 w-3" />
                      <span>{getArtistName(song)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>3:24</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => playingSongId === song.id ? stopAudio() : playAudio(song.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm ${
                        playingSongId === song.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                      }`}
                    >
                      {playingSongId === song.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.open(songApi.getStreamUrl(song.id), '_blank')}
                      className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredSongs.map((song, index) => (
                <div
                  key={song.id}
                  className="p-6 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <span className="text-sm text-gray-500 w-8 text-center">#{index + 1}</span>
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <Music className="h-6 w-6 text-white" />
                        </div>
                        {playingSongId === song.id && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg blur opacity-50 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                        {song.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{getArtistName(song)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>3:24</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(song.id)}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          likedSongs.has(song.id)
                            ? 'text-red-500 bg-red-50 hover:bg-red-100'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${likedSongs.has(song.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => playingSongId === song.id ? stopAudio() : playAudio(song.id)}
                        className={`p-3 rounded-full transition-all duration-200 shadow-md ${
                          playingSongId === song.id
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {playingSongId === song.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => window.open(songApi.getStreamUrl(song.id), '_blank')}
                        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No songs found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchQuery || selectedArtist
              ? 'Try adjusting your search or filter criteria to find more songs.'
              : 'No songs have been added yet. Start building your music library by adding your first song!'}
          </p>
          {!searchQuery && !selectedArtist && (
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 font-medium">
              Add Your First Song
            </button>
          )}
        </div>
      )}

      {/* Advanced Music Player */}
      {currentSong && (
        <AdvancedMusicPlayer
          song={currentSong}
          isPlaying={!!playingSongId}
          onPlay={handlePlayPause}
          onPause={handlePlayPause}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isMinimized={isPlayerMinimized}
          onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
        />
      )}
    </div>
  )
}
