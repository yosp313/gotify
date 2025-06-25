package user

import (
	"errors"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Id       uuid.UUID `json:"id" db:"id" gorm:"primaryKey;index"`
	FullName string    `json:"full_name" db:"full_name" gorm:"not null"`
	Email    string    `json:"email" db:"email" gorm:"not null;unique;index"`
	Password string    `json:"password" db:"password" gorm:"not null"`
}

func hashPassword(password string) (string, error) {
	// Implement password hashing logic here
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", errors.New("failed to hash password")
	}

	return string(hashedPassword), nil // Placeholder, replace with actual hashing
}

func (u *User) CheckPassword(password string) bool {
	// Implement password checking logic here
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

func NewUser(fullName, email, password string) (*User, error) {
	hashedPassword, err := hashPassword(password)
	if err != nil {
		panic(err)
	}

	return &User{
		Id:       uuid.New(),
		FullName: fullName,
		Email:    email,
		Password: hashedPassword,
	}, nil
}
