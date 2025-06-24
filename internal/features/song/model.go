package song

import (
	"errors"
	"os"

	"github.com/google/uuid"
)

type Song struct {
	Id       uuid.UUID `json:"id" db:"id" gorm:"primaryKey"`
	Title    string    `json:"title" db:"title" gorm:"not null"`
	ArtistId uuid.UUID `json:"artist_id" db:"artist_id" gorm:"not null;foreignKey"`
	Filename string    `json:"-" db:"file_name" gorm:"not null"`
}

func (s *Song) GetSongFile() (*os.File, error) {
	file, err := os.Open(s.Filename)
	if err != nil {
		return nil, errors.New("Couldn't Open the song file " + err.Error())
	}

	return file, nil
}

func (s *Song) ChangeSongTitle(newTitle string) {
	s.Title = newTitle
}
