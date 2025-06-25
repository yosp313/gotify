package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JwtAuthService struct {
	secretKey []byte
}

type JwtClaims struct {
	UserId   string `json:"user_id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	jwt.RegisteredClaims
}

func NewJwtAuthService(secretKey string) *JwtAuthService {
	if secretKey == "" {
		secretKey = "your-secret-key"
	}

	// turn into byte slice
	return &JwtAuthService{
		secretKey: []byte(secretKey),
	}
}

func (s *JwtAuthService) GenerateToken(userId, email, fullName string) (string, error) {
	claims := JwtClaims{
		UserId:   userId,
		Email:    email,
		FullName: fullName,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "gotify",
			Subject:   userId,
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.secretKey)
}

func (s *JwtAuthService) ValidateToken(tokenString string) (bool, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JwtClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return s.secretKey, nil
	})

	if err != nil || !token.Valid {
		return false, err
	}

	return true, nil
}
