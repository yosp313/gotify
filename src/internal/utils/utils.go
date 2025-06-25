package utils

import (
	"fmt"
	"os"

	"github.com/gin-gonic/gin"
)

func HandleError(err error, message string) {
	if err != nil {
		err := fmt.Errorf(message+" Error: %v", err)
		if err != nil {
			fmt.Println(err)
		}
	}
}

func HandleErrorWithMessage(c *gin.Context, err error, message string, statuscode int) {
	if err != nil {
		c.JSON(statuscode, gin.H{"message": message, "error": err.Error()})
	}
}

func GetEnv(key string, fallback string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return fallback
	}
	return value
}
