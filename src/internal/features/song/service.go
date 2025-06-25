package song

type SongService struct {
	repo SongRepository
}

func NewSongService(repo SongRepository) *SongService {
	return &SongService{repo: repo}
}

func (s *SongService) Create(song *Song) (string, error) {
	id, err := s.repo.Create(song)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (s *SongService) GetById(id string) (Song, error) {
	song, err := s.repo.GetById(id)
	if err != nil {
		return Song{}, err
	}
	return song, nil
}

func (s *SongService) GetByTitle(title string) ([]Song, error) {
	songs, err := s.repo.GetByTitle(title)
	if err != nil {
		return nil, err
	}
	return songs, nil
}

func (s *SongService) GetByArtistId(id string) ([]Song, error) {
	songs, err := s.repo.GetByArtistId(id)
	if err != nil {
		return nil, err
	}
	return songs, nil
}

func (s *SongService) GetAll() ([]Song, error) {
	songs, err := s.repo.GetAll()
	if err != nil {
		return nil, err
	}
	return songs, nil
}
