package api

import (
	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/config"
	"github.com/yosp313/gotify/src/internal/features/song"
	"github.com/yosp313/gotify/src/internal/features/user"
	"github.com/yosp313/gotify/src/internal/pkg/auth"
	"github.com/yosp313/gotify/src/internal/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Run() {
	cfg, err := config.LoadConfig()
	utils.HandleError(err, "Failed to load configuration")

	// Database connection and migration
	db, err := gorm.Open(sqlite.Open(cfg.DatabaseURL), &gorm.Config{})
	utils.HandleError(err, "Failed to connect to the database")

	err = db.AutoMigrate(&user.User{}, &song.Song{})
	utils.HandleError(err, "Failed to migrate database schema")

	c := gin.Default()

	// Middlewares
	c.Use(CORSMiddleware())

	// API Versioning
	api := c.Group("/api/v1")

	authService := auth.NewJwtAuthService(cfg.JWTSecret)

	// Users features
	{
		userRouter := api.Group("/users")
		userRepo := user.NewSqlUserRepository(db)
		userService := user.NewUserService(userRepo, authService)
		userHandler := user.NewUserHandler(userService)

		user.SetupRoutes(userRouter, userHandler, AuthMiddleware(authService))
		user.SetupAuthRoutes(api.Group("/auth"), userHandler)
	}

	// Song Features
	{
		songRouter := api.Group("/songs")
		songRepo := song.NewSqlSongRepository(db)
		songService := song.NewSongService(songRepo)
		songHandler := song.NewSongHandler(songService, authService)

		song.SetupRoutes(songRouter, songHandler, AuthMiddleware(authService))
	}

	c.Run(cfg.Port)
}
