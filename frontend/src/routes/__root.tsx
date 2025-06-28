import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Home, LogOut, Music, Plus, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { authApi, type User as UserType } from "../services/api";
import { LoadingPage } from "../components/LoadingSpinner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = authApi.isAuthenticated();

      if (authenticated) {
        try {
          const userData = await authApi.getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If fetching user fails, clear user data
          setCurrentUser(null);
          authApi.logout(); // Clear invalid token
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Remove dependency to prevent re-checking on every route change

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    navigate({ to: "/auth", replace: true });
  };

  const isActiveRoute = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Show a loading screen while we check auth status
  if (isLoading) {
    return <LoadingPage message="Authenticating..." />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg group-hover:shadow-lg transition-shadow">
                  <Music className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Gotify</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  to="/"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute("/")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/songs"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute("/songs")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <Music className="h-4 w-4" />
                  <span>Songs</span>
                </Link>

                <Link
                  to="/users"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveRoute("/users")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Artists</span>
                </Link>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                {currentUser && (
                  <div className="hidden md:flex items-center space-x-3">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {currentUser.full_name}
                      </span>
                    </div>
                  </div>
                )}

                <Link
                  to="/songs/create"
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Song</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
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
                  isActiveRoute("/")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/songs"
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActiveRoute("/songs")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                <Music className="h-5 w-5" />
                <span>Songs</span>
              </Link>

              <Link
                to="/users"
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActiveRoute("/users")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Artists</span>
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
              <div className="flex items-center space-x-2">
                <Music className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-600">
                  © 2025 Gotify. Your music, your way.
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Made with ❤️ for music lovers
              </div>
            </div>
          </div>
        </footer>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}
