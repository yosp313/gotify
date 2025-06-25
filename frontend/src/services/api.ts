import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}

export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface CreateSongRequest {
  title: string;
  artist_id: string;
  filename: string;
}

// User API
export const userApi = {
  create: async (userData: CreateUserRequest): Promise<{ message: string; id?: string }> => {
    const response = await api.post('/users', userData);
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
};

// Song API
export const songApi = {
  create: async (songData: CreateSongRequest): Promise<{ message: string; id: string }> => {
    const response = await api.post('/songs', songData);
    return response.data;
  },
  
  getAll: async (): Promise<Song[]> => {
    const response = await api.get('/songs');
    return response.data;
  },
  
  getById: async (id: string): Promise<Song> => {
    const response = await api.get(`/songs/${id}`);
    return response.data;
  },
  
  getByTitle: async (title: string): Promise<Song[]> => {
    const response = await api.get(`/songs/title?title=${encodeURIComponent(title)}`);
    return response.data;
  },
  
  getByArtistId: async (artistId: string): Promise<Song[]> => {
    const response = await api.get(`/songs/artists/${artistId}/songs`);
    return response.data;
  },
  
  getStreamUrl: (id: string): string => {
    return `${API_BASE_URL}/songs/${id}/stream`;
  },
};

export default api;
