package api

import (
	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/internal/features/user"
	"github.com/yosp313/gotify/internal/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Run() {
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	utils.HandleError(err, "Failed to connect to the database")

	c := gin.Default()
	api := c.Group("/api/v1")

	// Users features
	{
		userRouter := api.Group("/users")
		userRepo := user.NewSqlUserRepository(db)
		userService := user.NewUserService(userRepo)
		userHandler := user.NewUserHandler(userService)
		user.SetupUserRoutes(userRouter, userHandler)
	}
}
