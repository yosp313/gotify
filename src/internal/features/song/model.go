package song

import (
	"errors"
	"os"

	"github.com/google/uuid"
	"github.com/yosp313/gotify/src/internal/utils"
)

type Song struct {
	Id       uuid.UUID `json:"id" db:"id" gorm:"primaryKey"`
	Title    string    `json:"title" db:"title" gorm:"not null"`
	ArtistId uuid.UUID `json:"artist_id" db:"artist_id" gorm:"not null;foreignKey"`
	Filename string    `json:"-" db:"file_name" gorm:"not null"`

	// Relationships
	Artist User `json:"artist" gorm:"foreignKey:ArtistId;references:Id;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
type User struct {
	Id       uuid.UUID
	FullName string
	Email    string
	Password string
}

func NewSong(title string, artistId string, filename string) *Song {
	artistUUID, err := uuid.Parse(artistId)
	if err != nil {
		utils.HandleError(err, "Invalid artist ID format")
	}

	return &Song{
		Id:       uuid.New(),
		Title:    title,
		ArtistId: artistUUID,
		Filename: filename,
	}
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
