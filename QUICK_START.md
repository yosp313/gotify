# Quick Start Guide - Gotify Development

This guide will help you get the Gotify music streaming platform up and running quickly.

## 🚀 Quick Start

### 1. Backend Setup
```bash
# Install Go dependencies
go mod tidy

# Start the backend server
go run src/cmd/main.go
```
The backend will be available at: `http://localhost:8080`

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will be available at: `http://localhost:3000`

## 📱 Accessing the Application

1. **Open your browser** and navigate to: `http://localhost:3000`
2. **Dashboard**: View your music library statistics and search for songs
3. **Songs**: Browse your music collection with grid/list views
4. **Artists**: Manage artists and their songs
5. **Add Song**: Create new song entries

## 🎵 Getting Started with Music

### Step 1: Add Sample Audio Files
1. Place `.mp3`, `.wav`, or other audio files in the `songs/` directory
2. Remember the exact filename (e.g., `sample-song.mp3`)

### Step 2: Create an Artist
1. Go to the **Artists** page
2. Click **Add Artist**
3. Fill in the artist details
4. Note the artist ID for creating songs

### Step 3: Add Songs
1. Go to **Add Song** in the header
2. Enter song title
3. Select the artist (or use artist ID)
4. Enter the exact filename from step 1
5. Click **Create Song**

### Step 4: Play Music
1. Go to the **Songs** page
2. Click **Play** on any song
3. Enjoy your music! 🎵

## 🔧 API Endpoints

### Users (Artists)
- `POST /api/v1/users/` - Create a new user/artist
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/email/:email` - Get user by email

### Songs
- `POST /api/v1/songs` - Add a new song
- `GET /api/v1/songs` - Get all songs
- `GET /api/v1/songs/:id` - Get song by ID
- `GET /api/v1/songs/title?title=:title` - Search songs by title
- `GET /api/v1/songs/artists/:artistId/songs` - Get songs by artist
- `GET /api/v1/songs/:id/stream` - Stream a song

## 📁 Project Structure

```
gotify/
├── src/                    # Go backend source
│   ├── cmd/main.go        # Main entry point
│   └── internal/          # Internal packages
├── frontend/              # React frontend
│   ├── src/              # Frontend source
│   └── public/           # Static assets
├── songs/                # Audio files directory
├── go.mod                # Go dependencies
└── README.md            # This file
```

## 🎨 Features Showcase

### Modern Dashboard
- Beautiful gradient hero section
- Real-time statistics cards
- Quick search functionality
- Recent songs carousel

### Advanced Music Library
- Grid and list view modes
- Advanced filtering and search
- Like/favorite system
- Inline music player

### Professional Music Player
- Full playback controls
- Volume control with mute
- Progress tracking
- Beautiful animations

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts
- Dark mode ready

## 🐛 Troubleshooting

### Songs Not Playing?
1. Check that audio files exist in `songs/` directory
2. Verify filename matches exactly in database
3. Ensure browser supports audio format (MP3 recommended)

### Frontend Not Loading?
1. Check that backend is running on port 8080
2. Verify npm dependencies are installed
3. Check browser console for errors

### API Errors?
1. Verify backend server is running
2. Check network requests in browser dev tools
3. Ensure correct API endpoint URLs

## 🚀 Next Steps

1. **Add More Features**: Playlists, user authentication, upload functionality
2. **Customize Design**: Modify colors, fonts, and layouts
3. **Add Audio Processing**: Metadata extraction, waveform visualization
4. **Deploy**: Set up production deployment

## 📄 Learn More

- **Frontend**: See `frontend/README.md` for detailed frontend documentation
- **Backend**: Check Go source code for API implementation details
- **Contributing**: Follow the contribution guidelines in the main README

---

**Happy coding and enjoy your music! 🎵**
