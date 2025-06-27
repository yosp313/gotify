package user

type UserRepository interface {
	Create(user *User) (*User, error)
	GetById(id string) (User, error)
	GetByEmail(email string) (User, error)
	GetAll() ([]User, error)
}
