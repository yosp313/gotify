package song

import (
	"mime/multipart"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/pkg/auth"
	"github.com/yosp313/gotify/src/internal/utils"
)

type SongHandler struct {
	service     *SongService
	authService *auth.JwtAuthService
}

type SongCreateRequest struct {
	Title string                `form:"title" binding:"required"`
	File  *multipart.FileHeader `form:"file" binding:"required"`
}

func NewSongHandler(service *SongService, authService *auth.JwtAuthService) *SongHandler {
	return &SongHandler{service: service, authService: authService}
}

func (h *SongHandler) Create(c *gin.Context) {
	// Parse multipart form data
	var songReq SongCreateRequest
	if err := c.ShouldBind(&songReq); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid form data", 400)
		return
	}

	// Validate file type
	if !isValidAudioFile(songReq.File.Filename) {
		utils.HandleErrorWithMessage(c, nil, "Invalid file type. Only MP3, WAV, OGG, M4A files are allowed", 400)
		return
	}

	// Check file size (e.g., max 50MB)
	maxSize := int64(50 << 20) // 50MB
	if songReq.File.Size > maxSize {
		utils.HandleErrorWithMessage(c, nil, "File too large. Maximum size is 50MB", 400)
		return
	}

	userDetails, err := h.authService.ParseToken(c)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Unauthorized", 401)
		return
	}

	// Generate safe filename
	safeFilename := generateSafeFilename(songReq.File.Filename)
	filePath := filepath.Join("songs", safeFilename)

	// Ensure songs directory exists
	if err := os.MkdirAll("songs", 0755); err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to create songs directory", 500)
		return
	}

	// Check if file already exists
	if _, err := os.Stat(filePath); !os.IsNotExist(err) {
		utils.HandleErrorWithMessage(c, nil, "File with this name already exists", 409)
		return
	}

	// Save the uploaded file
	if err := c.SaveUploadedFile(songReq.File, filePath); err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to save file", 500)
		return
	}

	// Create song record in database
	song := NewSong(songReq.Title, userDetails.Subject, safeFilename)
	id, err := h.service.Create(song)
	if err != nil {
		// If database creation fails, remove the uploaded file
		os.Remove(filePath)
		utils.HandleErrorWithMessage(c, err, "Failed to create song record", 500)
		return
	}

	c.JSON(201, gin.H{
		"message":  "Song uploaded successfully",
		"id":       id,
		"filename": safeFilename,
	})
}

// Helper function to validate audio file extensions
func isValidAudioFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := []string{".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"}

	return slices.Contains(validExts, ext)
}

// Helper function to generate safe filename
func generateSafeFilename(originalFilename string) string {
	// Get file extension
	ext := filepath.Ext(originalFilename)

	// Remove extension and clean the name
	name := strings.TrimSuffix(originalFilename, ext)

	// Replace spaces and special characters
	name = strings.ReplaceAll(name, " ", "_")
	name = strings.ReplaceAll(name, "(", "")
	name = strings.ReplaceAll(name, ")", "")

	// You could also add timestamp or UUID to ensure uniqueness
	// name = fmt.Sprintf("%s_%d", name, time.Now().Unix())

	return name + ext
}

func (h *SongHandler) GetById(c *gin.Context) {
	id := c.Param("id")
	song, err := h.service.GetById(id)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to retrieve song", 500)
		return
	}

	c.JSON(200, song)
}

func (h *SongHandler) GetByTitle(c *gin.Context) {
	title := c.Query("title")
	if title == "" {
		utils.HandleErrorWithMessage(c, nil, "Title query parameter is required", 400)
		return
	}

	songs, err := h.service.GetByTitle(title)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to retrieve songs by title", 500)
		return
	}

	c.JSON(200, songs)
}

func (h *SongHandler) GetByArtistId(c *gin.Context) {
	id := c.Param("artistId")
	if id == "" {
		utils.HandleErrorWithMessage(c, nil, "Artist ID is required", 400)
		return
	}

	songs, err := h.service.GetByArtistId(id)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to retrieve songs by artist ID", 500)
		return
	}

	c.JSON(200, songs)
}

func (h *SongHandler) GetAll(c *gin.Context) {
	songs, err := h.service.GetAll()
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to retrieve all songs", 500)
		return
	}

	c.JSON(200, songs)
}

func (h *SongHandler) StreamSong(c *gin.Context) {
	songID := c.Param("id")

	// Get song from database
	song, err := h.service.GetById(songID)
	if err != nil {
		c.JSON(404, gin.H{"error": "Song not found"})
		return
	}

	// Construct file path
	filePath := filepath.Join("songs", song.Filename)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(404, gin.H{"error": "Audio file not found on disk"})
		return
	}

	// Determine content type based on file extension
	contentType := getContentType(song.Filename)

	// Set appropriate headers
	c.Header("Content-Type", contentType)
	c.Header("Accept-Ranges", "bytes")
	c.Header("Cache-Control", "public, max-age=3600")

	// Stream the file
	c.File(filePath)
}

// Helper function to get content type based on file extension
func getContentType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".mp3":
		return "audio/mpeg"
	case ".wav":
		return "audio/wav"
	case ".ogg":
		return "audio/ogg"
	case ".m4a":
		return "audio/mp4"
	case ".aac":
		return "audio/aac"
	case ".flac":
		return "audio/flac"
	default:
		return "audio/mpeg"
	}
}
