package user

import "github.com/gin-gonic/gin"

func SetupRoutes(c *gin.RouterGroup, userHandler *UserHandler, authMiddleware gin.HandlerFunc) {
	c.Use(authMiddleware)

	c.GET("", userHandler.HandleGetAllUsers)
	c.POST("", userHandler.HandleCreateUser)
	c.GET("/:id", userHandler.HandleGetUserById)
	c.GET("/email/:email", userHandler.HandleGetUserByEmail)
	c.GET("/me", userHandler.HandleGetCurrentUser)
}

func SetupAuthRoutes(c *gin.RouterGroup, userHandler *UserHandler) {
	c.POST("/signup", userHandler.HandleSignUp)
	c.POST("/login", userHandler.HandleLogin)
}
