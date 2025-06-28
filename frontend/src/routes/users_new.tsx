import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  Mail, 
  Music, 
  Search, 
  User as UserIcon, 
  Users, 
  UserPlus,
  Crown,
  Calendar,
  Eye,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Grid,
  List,
  X
} from "lucide-react";
import { songApi, userApi, authApi, type User, type Song } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const Route = createFileRoute("/users_new")({
  component: UsersPage,
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
});

interface UserWithSongs extends User {
  songCount: number;
  songs: Song[];
}

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithSongs[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserWithSongs[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithSongs | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'songs' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newUser, setNewUser] = useState<{
    full_name: string;
    email: string;
    password: string;
  }>({
    full_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allUsers, allSongs] = await Promise.all([
          userApi.getAll(),
          songApi.getAll(),
        ]);

        const validSongs = allSongs.filter(songApi.isValidSong);

        const usersWithSongs: UserWithSongs[] = allUsers.map((user: User) => {
          const userSongs = validSongs.filter((song: Song) =>
            song.artist.id === user.id
          );
          return {
            ...user,
            songCount: userSongs.length,
            songs: userSongs,
          };
        });

        setUsers(usersWithSongs);
        setFilteredUsers(usersWithSongs);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          authApi.logout();
          navigate({ to: '/auth', replace: true });
        } else {
          setError(err.response?.data?.error || 'Failed to fetch users.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    let filtered = users;
    
    // Filter by search
    if (searchQuery) {
      filtered = users.filter((user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort users
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'songs':
          comparison = a.songCount - b.songCount;
          break;
        case 'date':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(filtered);
  }, [searchQuery, users, sortBy, sortOrder]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create(newUser);
      setNewUser({ full_name: "", email: "", password: "" });
      setShowCreateForm(false);
      // Refresh the users list
      window.location.reload();
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading artists..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent">
                Artists
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and discover {users.length} talented artists
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 px-4 py-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-gray-700">{filteredUsers.length} artists</span>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus className="h-5 w-5" />
                <span>Add Artist</span>
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search artists by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all text-lg"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                {/* Sort Controls */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => toggleSort('name')}
                    className={`px-3 py-2 text-sm rounded-md transition-all flex items-center space-x-1 ${
                      sortBy === 'name' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span>Name</span>
                    {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                  <button
                    onClick={() => toggleSort('songs')}
                    className={`px-3 py-2 text-sm rounded-md transition-all flex items-center space-x-1 ${
                      sortBy === 'songs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span>Songs</span>
                    {sortBy === 'songs' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl mb-8 animate-bounce-in">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && users.length === 0 && (
          <div className="text-center py-20 animate-scale-in">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No artists yet</h3>
            <p className="text-gray-600 mb-6">Start building your artist roster!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Your First Artist</span>
            </button>
          </div>
        )}

        {/* No Search Results */}
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-20 animate-scale-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600 mb-6">No artists match "{searchQuery}". Try a different search term.</p>
            <button onClick={() => setSearchQuery("")} className="btn-secondary">
              Clear Search
            </button>
          </div>
        )}

        {/* Artists Grid/List */}
        {filteredUsers.length > 0 && (
          <div className="animate-fade-in">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user, index) => (
                  <ArtistCard
                    key={user.id}
                    user={user}
                    index={index}
                    onView={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg">
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <ArtistListItem
                      key={user.id}
                      user={user}
                      index={index}
                      onView={() => setSelectedUser(user)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Add Button */}
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110"
          >
            <UserPlus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Artist</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="input-modern"
                  placeholder="Enter artist's full name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-modern"
                  placeholder="Enter artist's email"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="input-modern"
                  placeholder="Create a password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
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
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// Artist Card Component for Grid View
function ArtistCard({
  user,
  index,
  onView,
}: {
  user: UserWithSongs;
  index: number;
  onView: () => void;
}) {
  return (
    <div 
      className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 card-hover animate-scale-in cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={onView}
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mx-auto">
          <span className="text-white text-2xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        {user.songCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {user.songCount}
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="text-center space-y-2">
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
          {user.full_name}
        </h3>
        <p className="text-gray-600 text-sm truncate">
          {user.email}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-center space-x-4 pt-3">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Music className="h-4 w-4" />
            <span>{user.songCount} songs</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Artist List Item Component for List View
function ArtistListItem({
  user,
  index,
  onView,
}: {
  user: UserWithSongs;
  index: number;
  onView: () => void;
}) {
  return (
    <div className="group flex items-center space-x-4 p-6 hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={onView}>
      {/* Avatar */}
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl font-bold">
            {user.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
        {user.songCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
            {user.songCount}
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors">
          {user.full_name}
        </h3>
        <p className="text-gray-600 truncate">{user.email}</p>
        <div className="flex items-center space-x-4 mt-1">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Music className="h-4 w-4" />
            <span>{user.songCount} songs</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(user.created_at || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="btn-secondary text-sm py-2 px-3"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// User Details Modal Component
function UserDetailsModal({
  user,
  onClose,
}: {
  user: UserWithSongs;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
              <Music className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-900">{user.songCount}</div>
              <div className="text-sm text-indigo-700">Songs</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {new Date(user.created_at || '').toLocaleDateString()}
              </div>
              <div className="text-sm text-green-700">Joined</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <Crown className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">Artist</div>
              <div className="text-sm text-purple-700">Role</div>
            </div>
          </div>

          {/* Songs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Music className="h-5 w-5 text-indigo-600" />
              <span>Songs ({user.songCount})</span>
            </h3>
            {user.songs.length > 0 ? (
              <div className="space-y-3">
                {user.songs.map((song) => (
                  <div key={song.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
                      <p className="text-sm text-gray-600">Audio file</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Music className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>No songs uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
