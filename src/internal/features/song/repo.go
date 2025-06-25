package song

import "gorm.io/gorm"

type SqlSongRepository struct {
	db *gorm.DB
}

func NewSqlSongRepository(db *gorm.DB) *SqlSongRepository {
	return &SqlSongRepository{db: db}
}

func (r *SqlSongRepository) Create(song *Song) (string, error) {
	if err := r.db.Create(song).Error; err != nil {
		return "", err
	}
	return song.Id.String(), nil
}

func (r *SqlSongRepository) GetById(id string) (Song, error) {
	var song Song
	if err := r.db.Preload("Artist").First(&song, "id = ?", id).Error; err != nil {
		return Song{}, err
	}
	return song, nil
}

func (r *SqlSongRepository) GetByTitle(title string) ([]Song, error) {
	var songs []Song
	if err := r.db.Preload("Artist").Where("title LIKE %?%", title).Find(&songs).Error; err != nil {
		return nil, err
	}
	return songs, nil
}

func (r *SqlSongRepository) GetByArtistId(id string) ([]Song, error) {
	var songs []Song
	if err := r.db.Preload("Artist").Where("artist_id = ?", id).Find(&songs).Error; err != nil {
		return nil, err
	}
	return songs, nil
}

func (r *SqlSongRepository) GetAll() ([]Song, error) {
	var songs []Song
	if err := r.db.Preload("Artist").Find(&songs).Error; err != nil {
		return nil, err
	}
	return songs, nil
}
