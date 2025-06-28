import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authApi, type Song, songApi } from "../../services/api";
import { AdvancedMusicPlayer } from "../../components/AdvancedMusicPlayer";
import { Music, PlusCircle } from "lucide-react";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export const Route = createFileRoute("/songs/")({
  component: SongsPage,
});

function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const fetchedSongs = await songApi.getAll();
        setSongs(fetchedSongs.filter((song) => songApi.isValidSong(song)));
      } catch (err: any) {
        if (err.response?.status === 401) {
          authApi.logout();
          navigate({ to: "/auth", replace: true });
        } else {
          setError(err.response?.data?.error || "Failed to fetch songs.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [navigate]);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
  };

  const handleNext = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const handlePrev = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSong(songs[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Music className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold">Your Music Library</h1>
          </div>
          <Link
            to="/songs/create"
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 flex items-center space-x-2"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Upload Song</span>
          </Link>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg my-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && songs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">Your library is empty.</p>
            <p className="text-gray-400">
              Upload your first song to get started!
            </p>
          </div>
        )}

        {!loading && songs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {songs.map((song) => (
              <div
                key={song.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer"
                onClick={() => handlePlay(song)}
              >
                <div className="p-5">
                  <h2 className="text-xl font-bold truncate text-gray-900">
                    {song.title}
                  </h2>
                  <p className="text-md text-gray-600">
                    {song.artist.full_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AdvancedMusicPlayer
            song={currentSong}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </div>
      )}
    </div>
  );
}
