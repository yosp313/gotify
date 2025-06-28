package user

import (
	"errors"

	"github.com/yosp313/gotify/src/internal/pkg/auth"
)

type UserService struct {
	repo UserRepository
	auth *auth.JwtAuthService
}

func NewUserService(repo UserRepository, authService *auth.JwtAuthService) *UserService {
	return &UserService{repo: repo, auth: authService}
}

func (s *UserService) SignUp(fullName, email, password string) (string, error) {
	user, err := NewUser(fullName, email, password)
	if err != nil {
		return "", err
	}

	_, err = s.repo.Create(user)
	if err != nil {
		return "", err
	}

	token, err := s.auth.GenerateToken(string(user.Id.String()), user.Email, user.FullName)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *UserService) SignUpWithUser(fullName, email, password string) (string, User, error) {
	user, err := NewUser(fullName, email, password)
	if err != nil {
		return "", User{}, err
	}

	_, err = s.repo.Create(user)
	if err != nil {
		return "", User{}, err
	}

	token, err := s.auth.GenerateToken(string(user.Id.String()), user.Email, user.FullName)
	if err != nil {
		return "", User{}, err
	}

	return token, *user, nil
}

func (s *UserService) Authenticate(email, password string) (string, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return "", err
	}

	if !user.CheckPassword(password) {
		return "", errors.New("invalid email or password")
	}

	token, err := s.auth.GenerateToken(string(user.Id.String()), user.Email, user.FullName)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *UserService) AuthenticateWithUser(email, password string) (string, User, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return "", User{}, err
	}

	if !user.CheckPassword(password) {
		return "", User{}, errors.New("invalid email or password")
	}

	token, err := s.auth.GenerateToken(string(user.Id.String()), user.Email, user.FullName)
	if err != nil {
		return "", User{}, err
	}

	return token, user, nil
}

func (s *UserService) GetUserById(id string) (User, error) {
	user, err := s.repo.GetById(id)
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func (s *UserService) GetUserByEmail(email string) (User, error) {
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return User{}, err
	}

	return user, nil
}

func (s *UserService) GetAllUsers() ([]User, error) {
	users, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}

	return users, nil
}
