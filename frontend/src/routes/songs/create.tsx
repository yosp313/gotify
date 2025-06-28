import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Upload, Music, Info } from 'lucide-react'
import { songApi, authApi, type CreateSongRequest } from '../../services/api'

export const Route = createFileRoute('/songs/create')({
  component: CreateSongPage,
  beforeLoad: async ({ navigate }) => {
    if (!authApi.isAuthenticated()) {
      navigate({ to: '/auth', replace: true })
      return
    }
    try {
      await authApi.getCurrentUser()
    } catch (error) {
      authApi.logout()
      navigate({ to: '/auth', replace: true })
    }
  },
})

function CreateSongPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadMode, setUploadMode] = useState<'upload' | 'select'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    filename: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableFiles, setAvailableFiles] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authApi.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()

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

    if (uploadMode === 'upload') {
      if (!selectedFile) {
        newErrors.file = 'Please select an audio file to upload'
      } else {
        // Validate file type
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/flac']
        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i)) {
          newErrors.file = 'Please select a valid audio file (MP3, WAV, OGG, M4A, AAC, FLAC)'
        }
        
        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (selectedFile.size > maxSize) {
          newErrors.file = 'File size must be less than 50MB'
        }
      }
    } else {
      if (!formData.filename.trim()) {
        newErrors.filename = 'Please select an audio file'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Check if user is authenticated
    if (!currentUser) {
      setErrors({ general: 'You must be logged in to create a song' })
      return
    }

    setLoading(true)
    
    try {
      let response
      
      if (uploadMode === 'upload' && selectedFile) {
        // Upload new file
        response = await songApi.uploadWithTitle(selectedFile, formData.title)
      } else {
        // Use existing file
        const songData: CreateSongRequest = {
          title: formData.title,
          filename: formData.filename
        }
        response = await songApi.create(songData)
      }
      
      console.log('Song created:', response)
      navigate({ to: '/songs' })
    } catch (error: any) {
      console.error('Error creating song:', error)
      
      // Handle specific error messages
      let errorMessage = 'Failed to create song. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.'
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid song data. Please check your input.'
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Maximum size is 50MB.'
      }
      
      setErrors({ general: errorMessage })
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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: '' }))
    }
    
    // Auto-fill title from filename if title is empty
    if (!formData.title) {
      const filename = file.name.replace(/\.[^/.]+$/, "") // Remove extension
      const cleanTitle = filename.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      setFormData(prev => ({ ...prev, title: cleanTitle }))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
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

          {/* Upload Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to add your song? *
            </label>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => setUploadMode('upload')}
                className={`flex-1 p-3 border rounded-lg transition-colors ${
                  uploadMode === 'upload'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Upload New File</span>
                </div>
                <p className="text-xs mt-1 opacity-75">Upload from your device</p>
              </button>
              
              <button
                type="button"
                onClick={() => setUploadMode('select')}
                className={`flex-1 p-3 border rounded-lg transition-colors ${
                  uploadMode === 'select'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Music className="h-4 w-4" />
                  <span className="font-medium">Select Existing</span>
                </div>
                <p className="text-xs mt-1 opacity-75">Choose from server</p>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          {uploadMode === 'upload' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : errors.file 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <Music className="h-12 w-12 text-indigo-600 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Choose different file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">
                        Drag and drop your audio file here, or{' '}
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                          onClick={() => document.getElementById('file-input')?.click()}
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supported: MP3, WAV, OGG, M4A, AAC, FLAC (Max 50MB)
                      </p>
                    </div>
                  </div>
                )}
                
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  className="hidden"
                />
              </div>
              {errors.file && (
                <p className="mt-1 text-sm text-red-600">{errors.file}</p>
              )}
            </div>
          )}

          {/* Filename Selection (existing files) */}
          {uploadMode === 'select' && (
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
          )}

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
                  <span>
                    {uploadMode === 'upload' ? 'Upload Song' : 'Create Song'}
                  </span>
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
              <li>• <strong>Upload New:</strong> Select and upload audio files directly from your device</li>
              <li>• <strong>Select Existing:</strong> Choose from files already on the server</li>
              <li>• Songs are automatically associated with your account as the artist</li>
              <li>• Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC (Max 50MB)</li>
              <li>• Drag and drop files for quick upload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
