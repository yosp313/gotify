# Gotify - Modern Music Streaming Platform

Gotify is a modern, full-stack music streaming platform designed to provide a seamless and visually appealing experience for managing and playing your music library. It features a robust Go-based backend API and a dynamic React frontend.

## ✨ Features

### Backend API

-   **User Management**: Create and manage users with secure password hashing.
-   **Song Management**: Add, retrieve, and stream songs.
-   **Music Streaming**: Efficiently stream audio files directly through the API.
-   **Search**: Search songs by title and filter by artist.
-   **RESTful API**: Clean and well-defined REST endpoints for all operations.

### Frontend Interface

-   **Immersive Dashboard**: Beautiful hero section with gradient backgrounds and real-time statistics.
-   **Advanced Music Player**: Full-featured audio player with playback controls, volume, and seeking.
-   **Smart Search**: Real-time search with instant results and interactive cards.
-   **Library Management**: Grid and list views for browsing songs, with filtering and sorting options.
-   **Artist Management**: Comprehensive artist profiles and song collections.
-   **Modern UI/UX**: Glassmorphism design, responsive layout, smooth animations, and dark mode readiness.

## 🛠️ Tech Stack

### Backend

-   **Go 1.24.4**: Modern, efficient backend language.
-   **Gin**: Fast HTTP web framework.
-   **GORM**: Powerful ORM for database operations.
-   **SQLite**: Lightweight database for development.
-   **bcrypt**: Secure password hashing.

### Frontend

-   **React 19**: Latest React with concurrent features.
-   **TypeScript**: Type-safe development.
-   **TanStack Router**: File-based routing with type safety.
-   **Vite**: Next-generation build tool for lightning-fast development.
-   **Tailwind CSS 4.0**: Utility-first CSS framework.
-   **Axios**: HTTP client for API calls.

## 🚀 Quick Start

To get Gotify up and running quickly, follow these steps:

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd gotify
```

### 2. Backend Setup

```bash
# Install Go dependencies
go mod tidy

# Create songs directory (if it doesn't exist)
mkdir -p songs

# Place your .mp3, .wav, or other audio files in the songs/ directory
# Example: songs/sample-song.mp3

# Start the backend server
go run src/cmd/main.go
```

The backend will be available at: `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to: `http://localhost:3000`

## 🎵 Getting Started with Music

1.  **Add Sample Audio Files**: Place your audio files (e.g., `.mp3`, `.wav`) in the `songs/` directory.
2.  **Create an Artist**: Go to the **Artists** page in the frontend and click **Add Artist**.
3.  **Add Songs**: Go to **Add Song** in the header, enter the song title, select the artist, and provide the exact filename from step 1.
4.  **Play Music**: Go to the **Songs** page and click **Play** on any song.

## 🔧 API Endpoints

### Users (Artists)

-   `POST /api/v1/users/` - Create a new user/artist
-   `GET /api/v1/users/:id` - Get user by ID
-   `GET /api/v1/users/email/:email` - Get user by email

### Songs

-   `POST /api/v1/songs` - Add a new song
-   `GET /api/v1/songs` - Get all songs
-   `GET /api/v1/songs/:id` - Get song by ID
-   `GET /api/v1/songs/title?title=:title` - Search songs by title
-   `GET /api/v1/songs/artists/:artistId/songs` - Get songs by artist
-   `GET /api/v1/songs/:id/stream` - Stream a song

## 📁 Project Structure

```
gotify/
├── src/                    # Go backend source
│   ├── cmd/main.go        # Main entry point
│   └── internal/          # Internal packages (api, features, pkg, utils)
├── frontend/              # React frontend
│   ├── public/           # Static assets
│   └── src/              # Frontend source (components, routes, services)
├── songs/                # Directory for audio files
├── go.mod                # Go dependencies
├── go.sum                # Go module checksums
└── README.md            # This file
```

## 🐛 Troubleshooting

-   **Songs Not Playing?**
    -   Ensure audio files exist in the `songs/` directory.
    -   Verify the filename in the database matches exactly.
    -   Check browser support for the audio format (MP3 recommended).
-   **Frontend Not Loading?**
    -   Check that the backend is running on `http://localhost:8080`.
    -   Verify npm dependencies are installed (`npm install` in `frontend/`).
    -   Check your browser's developer console for errors.
-   **API Errors?**
    -   Ensure the backend server is running.
    -   Check network requests in browser dev tools.
    -   Verify correct API endpoint URLs.

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a feature branch, make your changes, and submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).