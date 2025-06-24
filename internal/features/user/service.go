package user

type UserService struct {
	repo UserRepository
}

func NewUserService(repo UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (s *UserService) CreateUser(fullName, email, password string) error {
	user, err := NewUser(fullName, email, password)
	if err != nil {
		return err
	}

	_, err = s.repo.Create(user)
	if err != nil {
		return err
	}

	return nil
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
