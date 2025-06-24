package utils

import (
	"log"

	"github.com/gin-gonic/gin"
)

func HandleError(err error, message string) {
	if err != nil {
		log.Fatal(message)
	}
}

func HandleErrorWithMessage(c *gin.Context, err error, message string, statuscode int) {
	if err != nil {
		c.JSON(statuscode, gin.H{"message": message, "error": err.Error()})
	}
}
