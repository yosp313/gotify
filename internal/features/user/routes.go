package user

import "github.com/gin-gonic/gin"

func SetupUserRoutes(c *gin.RouterGroup, userHandler *UserHandler) {
	c.POST("/", userHandler.HandleCreateUser)
	c.GET("/:id", userHandler.HandleGetUserById)
	c.GET("/email/:email", userHandler.HandleGetUserByEmail)
}
