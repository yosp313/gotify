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
		var token string
		header := c.GetHeader("Authorization")

		if header != "" && len(header) > 7 {
			token = header[7:] // Remove "Bearer " prefix
		} else {
			// For streaming endpoints, also check query parameter
			token = c.Query("token")
		}

		if token == "" {
			c.JSON(401, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// Parse the token to get user claims
		claims, err := authService.ParseTokenString(token)
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set user info in context for use in handlers
		c.Set("user_id", claims.Subject)
		c.Set("user_email", claims.Email)
		c.Set("user_full_name", claims.FullName)

		// If token is valid, proceed to the next handler
		c.Next()
	}
}
