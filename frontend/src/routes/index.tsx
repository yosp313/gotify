import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Music, Users, Play, Search, TrendingUp, Clock, Heart, Headphones, Zap, Star, Volume2 } from 'lucide-react'
import { songApi } from '../services/api'
import type { Song } from '../services/api'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const [songs, setSongs] = useState<Song[]>([])
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allSongs = await songApi.getAll()
        setSongs(allSongs)
        setRecentSongs(allSongs.slice(-6)) // Get last 6 songs
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await songApi.getByTitle(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching songs:', error)
      setSearchResults([])
    }
  }

  const playAudio = (songId: string) => {
    if (currentAudio) {
      currentAudio.pause()
    }

    const audio = new Audio(songApi.getStreamUrl(songId))
    audio.play().catch(error => {
      console.error('Error playing audio:', error)
    })

    audio.onended = () => {
      setPlayingSongId(null)
      setCurrentAudio(null)
    }

    setCurrentAudio(audio)
    setPlayingSongId(songId)
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setPlayingSongId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-gray-600">Loading your music...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to <span className="text-yellow-300">Gotify</span>
              </h1>
              <p className="text-xl md:text-2xl text-indigo-100 mb-6">
                Your personal music streaming paradise
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Headphones className="h-5 w-5" />
                  <span className="font-medium">High Quality Audio</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Lightning Fast</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Music className="h-24 w-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <Music className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{songs.length}</p>
              <p className="text-sm text-gray-600">Total Songs</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{new Set(songs.map(s => s.artist_id)).size}</p>
              <p className="text-sm text-gray-600">Artists</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{recentSongs.length}</p>
              <p className="text-sm text-gray-600">Recently Added</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-4/5"></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-600">Favorites</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full w-1/4"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Section */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Discover Music</h2>
            </div>
            
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by song title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-lg"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 font-medium"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="animate-slide-up">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Search Results</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((song) => (
                    <div key={song.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">{song.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">Artist ID: {song.artist_id.slice(0, 8)}...</p>
                        </div>
                        <button
                          onClick={() => playingSongId === song.id ? stopAudio() : playAudio(song.id)}
                          className={`ml-4 p-2 rounded-full transition-all duration-200 shadow-md ${
                            playingSongId === song.id
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                        >
                          {playingSongId === song.id ? (
                            <div className="h-4 w-4 bg-current rounded-sm"></div>
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-500" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-all group">
                <Music className="h-5 w-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">Browse All Songs</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all group">
                <Users className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">View Artists</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all group">
                <Heart className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900">My Favorites</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">🎵 Music Tip</h3>
            <p className="text-indigo-100 text-sm">
              Use the search feature to quickly find your favorite songs, or browse by artist to discover new music!
            </p>
          </div>
        </div>
      </div>

      {/* Recent Songs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 card-hover">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recently Added</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {recentSongs.length} songs
          </span>
        </div>
        
        {recentSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSongs.map((song, index) => (
              <div key={song.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 card-hover border border-gray-100 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>
                  <button
                    onClick={() => playingSongId === song.id ? stopAudio() : playAudio(song.id)}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      playingSongId === song.id
                        ? 'bg-red-500 text-white hover:bg-red-600 pulse-playing'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'
                    }`}
                  >
                    {playingSongId === song.id ? (
                      <div className="h-5 w-5 bg-current rounded-sm"></div>
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors truncate">
                  {song.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">Artist ID: {song.artist_id.slice(0, 8)}...</p>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full w-0 group-hover:w-full transition-all duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No songs added yet</h3>
            <p className="text-gray-600 mb-6">Start building your music library by adding your first song!</p>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 font-medium">
              Add Your First Song
            </button>
          </div>
        )}
      </div>

      {/* Currently Playing */}
      {playingSongId && (
        <div className="fixed bottom-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 min-w-80 animate-scale-in music-player-shadow">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-25 animate-pulse"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Volume2 className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-medium text-gray-900">Now Playing</p>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {songs.find(s => s.id === playingSongId)?.title}
              </p>
            </div>
            <button
              onClick={stopAudio}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <div className="h-4 w-4 bg-current rounded-sm"></div>
            </button>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1 rounded-full w-1/3 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  )
}
