package user

type UserRepository interface {
	Create(user *User) (string, error)
	GetById(id string) (User, error)
	GetByEmail(email string) (User, error)
}
