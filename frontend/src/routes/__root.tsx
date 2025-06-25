import { Outlet, createRootRoute, Link, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Music, Users, Home, Plus, Settings, Volume2 } from 'lucide-react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  
  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Navigation */}
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <Music className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Gotify
                    </span>
                    <div className="text-xs text-gray-500 -mt-1">Music Streaming</div>
                  </div>
                </Link>
                
                {/* Navigation */}
                <nav className="hidden md:flex space-x-1">
                  <Link 
                    to="/" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/') 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/songs" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/songs') 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Music className="h-4 w-4" />
                    <span>Songs</span>
                  </Link>
                  <Link 
                    to="/users" 
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActiveRoute('/users') 
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Artists</span>
                  </Link>
                </nav>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-3">
                {/* Add Song Button */}
                <Link 
                  to="/songs/create" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:block">Add Song</span>
                </Link>

                {/* Settings */}
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t border-gray-200 bg-white/90 backdrop-blur-sm">
            <div className="flex justify-around py-2">
              <Link 
                to="/" 
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActiveRoute('/') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/songs" 
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActiveRoute('/songs') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Music className="h-5 w-5" />
                <span>Songs</span>
              </Link>
              <Link 
                to="/users" 
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActiveRoute('/users') 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Artists</span>
              </Link>
              <Link 
                to="/songs/create" 
                className="flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium text-indigo-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Music className="h-4 w-4" />
                <span>Gotify © 2025 - Modern Music Streaming</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Built with Go & React</span>
                <Volume2 className="h-4 w-4" />
              </div>
            </div>
          </div>
        </footer>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
