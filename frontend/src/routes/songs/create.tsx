import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Save, ArrowLeft, User, Music } from 'lucide-react'
import { songApi, userApi } from '../../services/api'
import type { User as UserType, Song } from '../../services/api'

export const Route = createFileRoute('/songs/create')({
  component: CreateSongPage,
})

function CreateSongPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [artists, setArtists] = useState<UserType[]>([])
  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    filename: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // For demo purposes, we'll create some sample artist IDs
    // In a real app, you'd fetch actual users
    const fetchArtists = async () => {
      try {
        // Get some sample songs to extract artist IDs
        const songs = await songApi.getAll()
        const uniqueArtistIds = Array.from(new Set(songs.map((s: any) => s.artist_id)))
        
        const artistsData: UserType[] = []
        for (const artistId of uniqueArtistIds.slice(0, 5)) {
          try {
            const { user } = await userApi.getById(artistId as string)
            artistsData.push(user)
          } catch (error) {
            // If user not found, create a placeholder
            artistsData.push({
              id: artistId as string,
              full_name: `Artist ${(artistId as string).slice(0, 8)}`,
              email: `artist-${(artistId as string).slice(0, 8)}@example.com`
            })
          }
        }
        setArtists(artistsData)
      } catch (error) {
        console.error('Error fetching artists:', error)
      }
    }

    fetchArtists()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Song title is required'
    }

    if (!formData.artist_id) {
      newErrors.artist_id = 'Artist selection is required'
    }

    if (!formData.filename.trim()) {
      newErrors.filename = 'Filename is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      await songApi.create(formData)
      navigate({ to: '/songs' })
    } catch (error) {
      console.error('Error creating song:', error)
      setErrors({ general: 'Failed to create song. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate({ to: '/songs' })}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Song</h1>
          <p className="text-gray-600">Create a new song entry in your music library</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Song Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song Title
            </label>
            <div className="relative">
              <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter song title..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Artist Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={formData.artist_id}
                onChange={(e) => handleInputChange('artist_id', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none ${
                  errors.artist_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select an artist...</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.full_name}
                  </option>
                ))}
              </select>
            </div>
            {errors.artist_id && (
              <p className="mt-1 text-sm text-red-600">{errors.artist_id}</p>
            )}
            
            {artists.length === 0 && (
              <p className="mt-1 text-sm text-blue-600">
                No artists found. You may need to create an artist first.
              </p>
            )}
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filename
            </label>
            <input
              type="text"
              value={formData.filename}
              onChange={(e) => handleInputChange('filename', e.target.value)}
              placeholder="e.g., song.mp3, track01.wav"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.filename ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.filename && (
              <p className="mt-1 text-sm text-red-600">{errors.filename}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Enter the filename of the audio file (should be in the songs directory)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate({ to: '/songs' })}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Create Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Tips</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Make sure the audio file exists in the <code className="bg-blue-100 px-1 rounded">songs/</code> directory</li>
          <li>• Supported formats: MP3, WAV, M4A, etc.</li>
          <li>• Use descriptive titles to make songs easy to find</li>
          <li>• If you don't see your artist, create them first in the Artists section</li>
        </ul>
      </div>
    </div>
  )
}
