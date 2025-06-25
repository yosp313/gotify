package song

import "github.com/gin-gonic/gin"

func SetupRoutes(c *gin.RouterGroup, h *SongHandler) {
	c.POST("", h.Create)
	c.GET("", h.GetAll)
	c.GET("/:id", h.GetById)
	c.GET("/title", h.GetByTitle)
	c.GET("/artists/:artistId/songs", h.GetByArtistId)
	c.GET("/:id/stream", h.StreamSong)
}
