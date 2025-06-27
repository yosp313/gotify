package user

import "gorm.io/gorm"

type SqlUserRepository struct {
	db *gorm.DB
}

func NewSqlUserRepository(db *gorm.DB) *SqlUserRepository {
	return &SqlUserRepository{db: db}
}

func (repo *SqlUserRepository) Create(user *User) (*User, error) {
	if err := repo.db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (repo *SqlUserRepository) GetById(id string) (User, error) {
	var user User
	if err := repo.db.First(&user, "id = ?", id).Error; err != nil {
		return User{}, err
	}
	return user, nil
}

func (repo *SqlUserRepository) GetByEmail(email string) (User, error) {
	var user User
	if err := repo.db.Preload("Songs").First(&user, "email = ?", email).Error; err != nil {
		return User{}, err
	}
	return user, nil
}

func (repo *SqlUserRepository) GetAll() ([]User, error) {
	var users []User
	if err := repo.db.Select("id", "full_name", "email").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}
