package user

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/yosp313/gotify/src/internal/utils"
)

type UserHandler struct {
	service *UserService
}

func NewUserHandler(service *UserService) *UserHandler {
	return &UserHandler{service: service}
}

type SignUpRequest struct {
	FullName string `json:"full_name" binding:"required,min=3"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type UserResponse struct {
	Id       string `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}

func (handler *UserHandler) HandleSignUp(c *gin.Context) {
	var request SignUpRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
		return
	}

	if request.FullName == "" || request.Email == "" || request.Password == "" {
		utils.HandleErrorWithMessage(c, nil, "Full name, email, and password are required", 400)
		return
	}

	token, user, err := handler.service.SignUpWithUser(request.FullName, request.Email, request.Password)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to create user", 500)
		return
	}

	c.JSON(201, gin.H{
		"token": token,
		"user": UserResponse{
			Id:       user.Id.String(),
			FullName: user.FullName,
			Email:    user.Email,
		},
	})
}

func (handler *UserHandler) HandleLogin(c *gin.Context) {
	var request LoginRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
		return
	}

	if request.Email == "" || request.Password == "" {
		utils.HandleErrorWithMessage(c, nil, "Email and password are required", 400)
		return
	}

	token, user, err := handler.service.AuthenticateWithUser(request.Email, request.Password)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to login", 401)
		return
	}

	c.SetCookie("token", token, int(time.Hour*24), "/", "", true, true) // Set cookie with 1 hour expiration
	c.JSON(200, gin.H{
		"token": token,
		"user": UserResponse{
			Id:       user.Id.String(),
			FullName: user.FullName,
			Email:    user.Email,
		},
	})
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

func (handler *UserHandler) HandleGetAllUsers(c *gin.Context) {
	users, err := handler.service.GetAllUsers()
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to get users", 500)
		return
	}

	var usersResponse []UserResponse
	for _, user := range users {
		usersResponse = append(usersResponse, UserResponse{
			Id:       user.Id.String(),
			FullName: user.FullName,
			Email:    user.Email,
		})
	}

	c.JSON(200, gin.H{"users": usersResponse})
}

func (handler *UserHandler) HandleGetCurrentUser(c *gin.Context) {
	// get user ID from the context (set by the auth middleware)
	email, exists := c.Get("user_email")
	if !exists {
		utils.HandleErrorWithMessage(c, nil, "User not authenticated", 401)
		return
	}
	fmt.Println("Email from context:", email)
	user, err := handler.service.GetUserByEmail(email.(string))
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to get current user", 404)
		return
	}

	c.JSON(200, UserResponse{
		Id:       user.Id.String(),
		FullName: user.FullName,
		Email:    user.Email,
	})
}

func (handler *UserHandler) HandleCreateUser(c *gin.Context) {
	var request SignUpRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.HandleErrorWithMessage(c, err, "Invalid request body", 400)
		return
	}

	if request.FullName == "" || request.Email == "" || request.Password == "" {
		utils.HandleErrorWithMessage(c, nil, "Full name, email, and password are required", 400)
		return
	}

	token, user, err := handler.service.SignUpWithUser(request.FullName, request.Email, request.Password)
	if err != nil {
		utils.HandleErrorWithMessage(c, err, "Failed to create user", 500)
		return
	}

	c.JSON(201, gin.H{
		"token": token,
		"user": UserResponse{
			Id:       user.Id.String(),
			FullName: user.FullName,
			Email:    user.Email,
		},
	})
}
