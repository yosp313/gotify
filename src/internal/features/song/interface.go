package song

type SongRepository interface {
	Create(song *Song) (string, error)
	GetAll() ([]Song, error)
	GetById(id string) (Song, error)
	GetByTitle(title string) ([]Song, error)
	GetByArtistId(id string) ([]Song, error)
}
