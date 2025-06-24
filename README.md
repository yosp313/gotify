# Gotify - Modern Music Streaming Platform

A beautiful, modern web frontend for the Gotify music streaming API built with Go, Gin, GORM, HTML, TailwindCSS, HTMX, and Alpine.js.
<!--toc:start-->
- [Gotify - Modern Music Streaming Platform](#gotify-modern-music-streaming-platform)
  - [Features](#features)
    - [Backend API](#backend-api)
    - [Frontend Interface](#frontend-interface)
  - [Tech Stack](#tech-stack)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [API Endpoints](#api-endpoints)
    - [Users](#users)
    - [Songs](#songs)
  - [Setup Instructions](#setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage Guide](#usage-guide)
    - [Creating Users](#creating-users)
    - [Adding Songs](#adding-songs)
    - [Playing Music](#playing-music)
    - [Searching](#searching)
  - [Project Structure](#project-structure)
  - [Development](#development)
    - [Adding New Features](#adding-new-features)
    - [Frontend Customization](#frontend-customization)
    - [Database Changes](#database-changes)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [API Testing](#api-testing)
  - [Contributing](#contributing)
  - [License](#license)
<!--toc:end-->

## Features

### Backend API

- **User Management**: Create users with secure password hashing
- **Song Management**: Add, retrieve, and stream songs
- **Music Streaming**: Stream audio files directly through the API
- **Search**: Search songs by title and filter by artist
- **RESTful API**: Clean REST endpoints for all operations

### Frontend Interface

- **Modern Dashboard**: Beautiful dark theme with gradient accents
- **Real-time Updates**: HTMX-powered dynamic content updates
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Music Player**: Built-in audio player with controls
- **User Management**: Create and search users
- **Song Library**: Browse, search, and manage songs
- **Interactive UI**: Smooth animations and transitions

## Tech Stack

### Backend

- **Go 1.24.4**: Modern, efficient backend language
- **Gin**: Fast HTTP web framework
- **GORM**: Powerful ORM for database operations
- **SQLite**: Lightweight database for development
- **bcrypt**: Secure password hashing

### Frontend

- **HTML5**: Semantic markup
- **TailwindCSS**: Utility-first CSS framework
- **HTMX**: Dynamic HTML without complex JavaScript
- **Alpine.js**: Lightweight JavaScript framework for reactivity
- **Font Awesome**: Beautiful icons

## API Endpoints

### Users

- `POST /api/v1/users/` - Create a new user
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/email/:email` - Get user by email

### Songs

- `POST /api/v1/songs` - Add a new song
- `GET /api/v1/songs` - Get all songs
- `GET /api/v1/songs/:id` - Get song by ID
- `GET /api/v1/songs/title?title=:title` - Search songs by title
- `GET /api/v1/songs/artists/:artistId/songs` - Get songs by artist ID
- `GET /api/v1/songs/:id/stream` - Stream a song

## Setup Instructions

### Prerequisites

- Go 1.24.4 or later
- Git

### Installation

1. **Clone the repository**:

   ```bash
   git clone <your-repo-url>
   cd gotify
   ```

2. **Install dependencies**:

   ```bash
   go mod tidy
   ```

3. **Create songs directory** (if not exists):

   ```bash
   mkdir -p songs
   ```

4. **Add some sample music files**:
   Place your `.mp3` files in the `songs/` directory. Example:

   ```
   songs/
   ├── sample-song-1.mp3
   ├── sample-song-2.mp3
   └── another-song.mp3
   ```

5. **Run the application**:

   ```bash
   go run cmd/main.go
   ```

6. **Open your browser**:
   Navigate to `http://localhost:8080`

## Usage Guide

### Creating Users

1. Click the "Add User" button in the header
2. Fill in the user details (Full Name, Email, Password)
3. Click "Create User"

### Adding Songs

1. Click the "Add Song" button in the header
2. Enter song details:
   - **Title**: The name of the song
   - **Artist ID**: UUID of the artist (create a user first and use their ID)
   - **Filename**: Name of the audio file in the `songs/` directory
3. Click "Add Song"

### Playing Music

1. Go to the "Songs" page
2. Click "Play" on any song
3. The player will open with the selected song
4. Use the built-in controls to play/pause/seek

### Searching

- Use the search bar on the Songs page to find songs by title
- Search is real-time and updates as you type

## Project Structure

```
gotify/
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   ├── api/
│   │   └── app.go             # Main API setup and routing
│   ├── features/
│   │   ├── song/              # Song-related functionality
│   │   │   ├── handler.go     # HTTP handlers
│   │   │   ├── interface.go   # Repository interface
│   │   │   ├── model.go       # Song model
│   │   │   ├── repo.go        # Database repository
│   │   │   ├── routes.go      # Route definitions
│   │   │   └── service.go     # Business logic
│   │   └── user/              # User-related functionality
│   │       ├── handler.go     # HTTP handlers  
│   │       ├── interface.go   # Repository interface
│   │       ├── model.go       # User model
│   │       ├── repo.go        # Database repository
│   │       ├── routes.go      # Route definitions
│   │       └── service.go     # Business logic
│   └── utils/
│       └── utils.go           # Utility functions
├── web/
│   ├── index.html             # Main frontend application
│   └── static/
│       └── js/
│           └── app.js         # Frontend JavaScript
├── songs/                     # Audio files directory
├── go.mod                     # Go module dependencies
├── go.sum                     # Go module checksums
├── gorm.db                    # SQLite database (generated)
└── README.md                  # This file
```

## Development

### Adding New Features

1. Follow the existing pattern in `internal/features/`
2. Create the necessary model, repository, service, handler, and routes
3. Register routes in `internal/api/app.go`

### Frontend Customization

- Edit `web/index.html` for structure changes
- Modify `web/static/js/app.js` for JavaScript functionality
- TailwindCSS classes can be customized in the HTML

### Database Changes

- Modify models in the respective `model.go` files
- GORM will automatically migrate changes on startup

## Troubleshooting

### Common Issues

1. **Songs not playing**:
   - Ensure audio files are in the `songs/` directory
   - Check that the filename in the database matches the actual file
   - Verify the audio format is supported by browsers (MP3 recommended)

2. **Database errors**:
   - Delete `gorm.db` and restart to recreate the database
   - Check that all required fields are provided when creating records

3. **Frontend not loading**:
   - Ensure the `web/` directory exists and contains `index.html`
   - Check browser console for JavaScript errors
   - Verify API endpoints are responding correctly

### API Testing

You can test the API endpoints using curl:

```bash
# Create a user
curl -X POST http://localhost:8080/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","password":"password123"}'

# Get all songs
curl http://localhost:8080/api/v1/songs

# Add a song (replace ARTIST_ID with actual user ID)
curl -X POST http://localhost:8080/api/v1/songs \
  -H "Content-Type: application/json" \
  -d '{"title":"My Song","artist_id":"ARTIST_ID","filename":"sample-song.mp3"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.

---

Enjoy streaming music with Gotify! 🎵
