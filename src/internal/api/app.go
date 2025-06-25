package api

import (
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yosp313/gotify/internal/features/song"
	"github.com/yosp313/gotify/internal/features/user"
	"github.com/yosp313/gotify/internal/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Run() {
	error := godotenv.Load(".env")
	if error != nil {
		utils.HandleError(error, "Failed to load .env file")
	}

	db, err := gorm.Open(sqlite.Open(utils.GetEnv("DATABASE_URL", "test.db")), &gorm.Config{})
	utils.HandleError(err, "Failed to connect to the database")

	err = db.AutoMigrate(&user.User{}, &song.Song{})
	utils.HandleError(err, "Failed to migrate database schema")

	c := gin.Default()
	api := c.Group("/api/v1")

	// Users features
	{
		userRouter := api.Group("/users")
		userRepo := user.NewSqlUserRepository(db)
		userService := user.NewUserService(userRepo)
		userHandler := user.NewUserHandler(userService)
		user.SetupRoutes(userRouter, userHandler)
	}

	// Song Features
	{
		songRouter := api.Group("/songs")
		songRepo := song.NewSqlSongRepository(db)
		songService := song.NewSongService(songRepo)
		songHandler := song.NewSongHandler(songService)
		song.SetupRoutes(songRouter, songHandler)
	}

	c.Run(utils.GetEnv("PORT", ":8080"))
}
