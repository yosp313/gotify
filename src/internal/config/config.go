package config

import (
	"github.com/joho/godotenv"
	"github.com/yosp313/gotify/src/internal/utils"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
}

func LoadConfig() (*Config, error) {
	// Load configuration from environment variables or a config file
	err := godotenv.Load()
	utils.HandleError(err, "Error loading .env file")

	return &Config{
		Port:        utils.GetEnv("PORT", "8080"),
		DatabaseURL: utils.GetEnv("DATABASE_URL", "postgres://user:password@localhost:5432/gotify"),
		JWTSecret:   utils.GetEnv("JWT_SECRET", "defaultsecret"),
	}, nil
}
