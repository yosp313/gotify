# Gotify Frontend - Refactored for Backend Integration

This frontend has been completely refactored to work seamlessly with the backend API changes and improved data handling.

## Key Changes Made

### 1. **API Service Layer Improvements**
- **Enhanced Error Handling**: Better error messages and auth token management
- **Helper Functions**: Added `getArtistName()` and `isValidSong()` utilities
- **Consistent Data Validation**: Filters out invalid songs throughout the app
- **Better Token Parsing**: Improved JWT token handling with error recovery

### 2. **Component Refactoring**
- **Unified Artist Display**: All components now use `songApi.getArtistName()` for consistent artist information
- **Data Validation**: Components validate song data before rendering or playing
- **Loading States**: Consistent loading components across all pages
- **Error Boundaries**: Added error boundary component for better error handling

### 3. **Backend Integration**
- **Fixed Relationships**: Properly handles artist-song relationships from backend
- **Authentication Flow**: Improved token-based authentication
- **Song Creation**: Streamlined song creation that uses artist ID from auth token
- **Real Artist Data**: Displays actual artist names instead of IDs

### 4. **User Experience Improvements**
- **Better Validation**: Songs with invalid data are filtered out from display
- **Consistent Loading**: Unified loading spinner component
- **Error Recovery**: Graceful error handling with retry options
- **Responsive Design**: Improved mobile and desktop experience

## Running the Application

### Development
```bash
npm run dev
```
This starts the development server on port 3000.

### Production Build
```bash
npm run build
npm run preview
```

### Testing
```bash
npm test
```

## Environment Setup

The frontend expects the backend to be running on `http://localhost:8080`. Make sure:

1. **Backend is running** with proper database setup
2. **CORS is configured** to allow frontend origin
3. **JWT authentication** is working properly
4. **Song files** are available in the backend's songs directory

## File Structure

```
src/
├── components/
│   ├── AdvancedMusicPlayer.tsx    # Enhanced music player with visualizations
│   ├── MusicPlayer.tsx            # Basic music player component
│   ├── ErrorBoundary.tsx          # Error boundary for app-wide error handling
│   └── LoadingSpinner.tsx         # Consistent loading component
├── routes/
│   ├── __root.tsx                 # Root layout with navigation and auth
│   ├── index.tsx                  # Dashboard with stats and recent songs
│   ├── songs.tsx                  # Songs listing with grid/list views
│   ├── users.tsx                  # Artists management page
│   ├── auth.tsx                   # Login/register page
│   └── songs/
│       └── create.tsx             # Song creation form
├── services/
│   └── api.ts                     # API service layer with all backend integration
└── main.tsx                       # App entry point with error boundary
```

## Key Features

### 🎵 **Music Player**
- Stream audio files from backend
- Audio visualization
- Volume control and progress tracking
- Next/previous song navigation

### 🎨 **Artist Management**
- Display real artist information
- View songs by artist
- Artist creation and management

### 📱 **Responsive Design**
- Mobile-first approach
- Beautiful animations and transitions
- Consistent design system

### 🔐 **Authentication**
- JWT-based authentication
- Automatic token management
- Protected routes

### 🎯 **Data Integrity**
- Validates song data before display
- Handles missing or invalid relationships
- Graceful error handling

## API Integration

The frontend integrates with these backend endpoints:

- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/songs` - Get all songs with artist relationships
- `POST /api/v1/songs` - Create new song (uses auth token for artist)
- `GET /api/v1/songs/:id/stream` - Stream audio file
- `GET /api/v1/users/:id` - Get user/artist information

## Contributing

When making changes:

1. **Follow TypeScript best practices**
2. **Use the existing component structure**
3. **Test with various data states** (empty, invalid, missing relationships)
4. **Ensure responsive design**
5. **Add proper error handling**

## Troubleshooting

### Common Issues

1. **No songs displaying**: Check if backend is returning valid song data with artist relationships
2. **Authentication errors**: Verify JWT token format and backend auth middleware
3. **Audio not playing**: Ensure audio files exist in backend songs directory
4. **CORS errors**: Configure backend CORS to allow frontend origin

### Debug Tools

- Browser DevTools Network tab for API calls
- Console for validation errors and warnings
- React DevTools for component state
- TanStack Router DevTools for routing issues
