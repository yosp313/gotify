package song

import (
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/pkg/auth"
	"github.com/yosp313/gotify/src/internal/utils"
)

type SongHandler struct {
	service     *SongService
	authService *auth.JwtAuthService
}

type SongCreateRequest struct {
	Title    string `json:"title" binding:"required"`
	Filename string `json:"filename" binding:"required"`
}

func NewSongHandler(service *SongService, authService *auth.JwtAuthService) *SongHandler {
	return &SongHandler{service: service, authService: authService}
}

func (h *SongHandler) Create(c *gin.Context) {
	var songReq SongCreateRequest
	if err := c.ShouldBindJSON(&songReq); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
		return
	}

	authHeader := c.GetHeader("Authorization")

	token := authHeader[len("Bearer "):]

	userDetails, err := h.authService.ParseToken(token)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Unauthorized", 401)
		return
	}

	// Sanitize filename to prevent path traversal
	safeFilename := filepath.Base(songReq.Filename)

	song := NewSong(songReq.Title, userDetails.Subject, safeFilename)
	id, err := h.service.Create(song)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to create song", 500)
		return
	}

	c.JSON(201, gin.H{"message": "Song created successfully", "id": id})
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

	// Set appropriate headers
	c.Header("Content-Type", "audio/mpeg")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Cache-Control", "public, max-age=3600")

	// Stream the file
	c.File(filePath)
}
