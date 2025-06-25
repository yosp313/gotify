import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Music, Info } from 'lucide-react'
import { songApi, authApi, type CreateSongRequest } from '../../services/api'

export const Route = createFileRoute('/songs/create_new')({
  component: CreateSongPage,
})

function CreateSongPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [formData, setFormData] = useState<CreateSongRequest>({
    title: '',
    filename: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableFiles, setAvailableFiles] = useState<string[]>([])

  useEffect(() => {
    // Get current user from auth
    const user = authApi.getCurrentUser()
    setCurrentUser(user)

    // Simulate getting available audio files from the songs directory
    // In a real app, you'd have an API to list available files
    setAvailableFiles([
      'Hal Di Kat Hayatak.mp3',
      'Khesert El Sha3b.mp3',
      'TNKR..mp3'
    ])
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Song title is required'
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
      const response = await songApi.create(formData)
      console.log('Song created:', response)
      navigate({ to: '/songs' })
    } catch (error: any) {
      console.error('Error creating song:', error)
      setErrors({ 
        general: error.response?.data?.error || 'Failed to create song. Please try again.' 
      })
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
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Song</h1>
          <p className="text-gray-600">Share your music with the world</p>
        </div>
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Music className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              Creating song as: {currentUser.full_name}
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Song Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Song Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter the song title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Filename Selection */}
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <select
              id="filename"
              value={formData.filename}
              onChange={(e) => handleInputChange('filename', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.filename ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an audio file</option>
              {availableFiles.map((file) => (
                <option key={file} value={file}>
                  {file}
                </option>
              ))}
            </select>
            {errors.filename && (
              <p className="mt-1 text-sm text-red-600">{errors.filename}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate({ to: '/songs' })}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Create Song</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-2">How to add songs</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Upload your audio files to the server's songs directory</li>
              <li>• Select the file from the dropdown above</li>
              <li>• The song will be associated with your account as the artist</li>
              <li>• Supported formats: MP3, WAV, FLAC</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
