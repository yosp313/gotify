import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      // Redirect to auth page
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: string;
  full_name: string;
  email: string;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  filename: string;
  artist?: User; // Optional populated artist data
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface CreateSongRequest {
  title: string;
  filename: string; // artist_id comes from auth token
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("authToken");
  },

  getCurrentUser: (): User | null => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      // Parse JWT payload (basic decode - in production use a proper JWT library)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        id: payload.user_id || payload.UserId,
        full_name: payload.user_name || payload.FullName,
        email: payload.user_email || payload.Email,
      };
    } catch (error) {
      console.error("Error parsing token:", error);
      localStorage.removeItem("authToken"); // Clear invalid token
      return null;
    }
  },

  // Add helper to get artist name from song
  getArtistName: (song: Song): string => {
    return song.artist?.full_name || "Unknown Artist";
  },
};

// User API
export const userApi = {
  create: async (
    userData: CreateUserRequest,
  ): Promise<{ message: string; id?: string }> => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  getById: async (id: string): Promise<{ user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<{ user: User }> => {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data;
  },
};

// Song API
export const songApi = {
  create: async (
    songData: CreateSongRequest,
  ): Promise<{ message: string; song?: Song }> => {
    const response = await api.post("/songs", songData);
    return response.data;
  },

  getAll: async (): Promise<Song[]> => {
    const response = await api.get("/songs");
    return response.data;
  },

  getById: async (id: string): Promise<Song> => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },

  getByTitle: async (title: string): Promise<Song[]> => {
    const response = await api.get(
      `/songs/title?title=${encodeURIComponent(title)}`,
    );
    return response.data;
  },

  getByArtistId: async (artistId: string): Promise<Song[]> => {
    const response = await api.get(`/songs/artists/${artistId}/songs`);
    return response.data;
  },

  // Get stream URL - this will be used by audio elements
  getStreamUrl: (id: string): string => {
    return `${API_BASE_URL}/songs/${id}/stream`;
  },

  // Get authenticated audio data for playback
  getAuthenticatedAudio: async (id: string): Promise<string> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch the audio with proper authentication
      const response = await fetch(`${API_BASE_URL}/songs/${id}/stream`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/auth";
          throw new Error("Authentication failed");
        }
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Failed to get authenticated audio:", error);
      throw error;
    }
  },

  // Legacy method - keeping for backward compatibility
  getAuthenticatedStreamUrl: async (id: string): Promise<string> => {
    return songApi.getAuthenticatedAudio(id);
  },

  // Helper functions
  getArtistName: (song: Song): string => {
    console.log(song);
    return song.artist?.full_name || "Unknown Artist";
  },

  isValidSong: (song: Song): boolean => {
    return !!(song.id && song.id !== "00000000-0000-0000-0000-000000000000" &&
      song.title);
  },
};

export default api;
