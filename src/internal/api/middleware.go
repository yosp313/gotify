package api

import (
	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/pkg/auth"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204) // No Content
			return
		}

		c.Next()
	}
}

func AuthMiddleware(authService *auth.JwtAuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Here you would typically extract the token from the Authorization header
		// and validate it using your authentication service.
		// For simplicity, we will just check if a token is present.

		var token string
		header := c.GetHeader("Authorization")

		if header != "" {
			token = header[len("Bearer "):] // Assuming the token is prefixed with "Bearer "
		} else {
			// For streaming endpoints, also check query parameter
			token = c.Query("token")
		}

		if token == "" {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Validate the token (this is a placeholder, replace with actual validation logic)
		valid, err := authService.ValidateToken(token)
		if err != nil || !valid {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// If token is valid, proceed to the next handler
		c.Next()
	}
}
