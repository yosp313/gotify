package song

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/utils"
)

type SongHandler struct {
	service *SongService
}

type SongCreateRequest struct {
	Title    string `json:"title" binding:"required"`
	ArtistId string `json:"artist_id" binding:"required"`
	Filename string `json:"filename" binding:"required"`
}

func NewSongHandler(service *SongService) *SongHandler {
	return &SongHandler{service: service}
}

func (h *SongHandler) Create(c *gin.Context) {
	var songReq SongCreateRequest
	if err := c.ShouldBindJSON(&songReq); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
		return
	}

	song := NewSong(songReq.Title, songReq.ArtistId, songReq.Filename)
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
	id := c.Param("id")

	song, err := h.service.GetById(id)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to retrieve song", 500)
		return
	}

	safeFilename := filepath.Base(song.Filename)
	filePath := filepath.Join("songs", safeFilename)

	file, err := os.Open(filePath)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to open song file", 500)
		return
	}
	defer file.Close()

	fi, err := file.Stat()
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to get file info", 500)
		return
	}

	c.Writer.Header().Set("Content-Type", "audio/mpeg")
	c.Writer.Header().Set("Accept-Ranges", "bytes")
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Range")

	http.ServeContent(c.Writer, c.Request, safeFilename, fi.ModTime(), file)
}
