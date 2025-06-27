import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Users, User, Mail, Search, Music } from 'lucide-react'
import { userApi, songApi } from '../services/api'
import { LoadingSpinner } from '../components/LoadingSpinner'
import type { User as UserType, Song } from '../services/api'

export const Route = createFileRoute('/users')({
  component: UsersPage,
})

interface UserWithSongs extends UserType {
  songCount: number;
  songs: Song[];
}

function UsersPage() {
  const [users, setUsers] = useState<UserWithSongs[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<UserWithSongs[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithSongs | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all users and all songs
        const [allUsers, allSongs] = await Promise.all([
          userApi.getAll(),
          songApi.getAll()
        ])
        
        // Filter valid songs
        const validSongs = allSongs.filter(songApi.isValidSong)
        
        // Create users with their song counts
        const usersWithSongs: UserWithSongs[] = allUsers.map(user => {
          const userSongs = validSongs.filter(song => song.artist_id === user.id)
          return {
            ...user,
            songCount: userSongs.length,
            songs: userSongs
          }
        })
        
        setUsers(usersWithSongs)
        setFilteredUsers(usersWithSongs)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.create(newUser)
      setNewUser({ full_name: '', email: '', password: '' })
      setShowCreateForm(false)
      // Refresh the users list
      window.location.reload()
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading artists..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artists</h1>
          <p className="text-gray-600">Manage your music artists and their songs</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Users className="h-4 w-4" />
          <span>Add Artist</span>
        </button>
      </div>

      {/* Search and Advanced Features */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search artists by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} artists
        </span>
        <span className="text-sm text-gray-600">
          Total songs: {users.reduce((sum, user) => sum + user.songCount, 0)}
        </span>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {user.full_name}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Music className="h-4 w-4" />
                <span>{user.songCount} songs</span>
              </div>
              <div className="text-indigo-600 font-medium">View Details</div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'No artists have been added yet. Start by adding your first artist!'}
          </p>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Artist</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create Artist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Artist Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.full_name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Songs ({selectedUser.songCount})
                </h4>
                {selectedUser.songs.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Music className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium text-gray-900">{song.title}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (songApi.isValidSong(song)) {
                              const audio = new Audio(songApi.getStreamUrl(song.id))
                              audio.play().catch(console.error)
                            } else {
                              console.warn('Cannot play invalid song:', song)
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm disabled:opacity-50"
                          disabled={!songApi.isValidSong(song)}
                        >
                          {songApi.isValidSong(song) ? 'Play' : 'Unavailable'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No songs available for this artist.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
