package user

import (
	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/internal/utils"
)

type UserHandler struct {
	service *UserService
}

func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{service: service}
}

type CreateRequest struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (handler *UserHandler) HandleCreateUser(c *gin.Context) {
	// serialize the request body into CreateRequest
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
	}
	err := handler.service.CreateUser(req.FullName, req.Email, req.Password)
	utils.HandleErrorWithMessage(c, err, "Failed to create user", 500)

	c.JSON(201, gin.H{"message": "User created successfully"})
}

func (handler *UserHandler) HandleGetUserById(c *gin.Context) {
	// get user ID from the URL parameter
	userID := c.Param("id")
	if userID == "" {
		utils.HandleErrorWithMessage(c, nil, "User ID is required", 400)
		return
	}

	user, err := handler.service.GetUserById(userID)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to get user", 404)
		return
	}

	c.JSON(200, gin.H{"user": user})
}

func (handler *UserHandler) HandleGetUserByEmail(c *gin.Context) {
	// get email from the URL parameter
	email := c.Param("email")
	if email == "" {
		utils.HandleErrorWithMessage(c, nil, "Email is required", 400)
		return
	}

	user, err := handler.service.GetUserByEmail(email)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to get user", 404)
		return
	}

	c.JSON(200, gin.H{"user": user})
}
