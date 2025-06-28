import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear the token and redirect to login
      localStorage.removeItem("token");
      // Only redirect if we're not already on the auth page
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
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  artist: User;
  created_at?: string;
  updated_at?: string;
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  full_name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },
  signup: async (userData: SignUpRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
  isAuthenticated: () => {
    return localStorage.getItem("token") !== null;
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },
};

export interface CreateSongRequest {
  title: string;
  filename: string;
}

export const songApi = {
  getAll: async (): Promise<Song[]> => {
    const response = await api.get<Song[]>("/songs");
    return response.data;
  },
  create: async (songData: CreateSongRequest): Promise<Song> => {
    const response = await api.post<Song>("/songs", songData);
    return response.data;
  },
  upload: async (file: File): Promise<Song> => {
    const formData = new FormData();
    formData.append("song", file);
    const response = await api.post<Song>("/songs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  uploadWithTitle: async (file: File, title: string): Promise<Song> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    const response = await api.post<Song>("/songs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getByTitle: async (title: string): Promise<Song[]> => {
    const response = await api.get<Song[]>(
      `/songs/search?title=${encodeURIComponent(title)}`,
    );
    return response.data;
  },
  getSongUrl: (filePath: string): string => {
    return `${API_BASE_URL}/songs/stream/${encodeURIComponent(filePath)}`;
  },
  getStreamUrl: (songId: string | number): string => {
    const token = localStorage.getItem("token");
    const baseUrl = `${API_BASE_URL}/songs/${songId}/stream`;
    return token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;
  },
  getArtistName: (song: Song): string => {
    return song.artist?.full_name || "Unknown Artist";
  },
  isValidSong: (song: Song): boolean => {
    return !!(song.id && song.title && song.artist);
  },
};

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
}

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },
  create: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>("/users", userData);
    return response.data;
  },
};

export default api;
