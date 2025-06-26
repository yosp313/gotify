package filestorage

type FileStorageService interface {
	UploadFile(filePath string, fileName string) (string, error)
	// DownloadFile(fileId string) (string, error)
}

type LocalFileStorageService struct{}

func NewLocalFileStorageService() *LocalFileStorageService {
	return &LocalFileStorageService{}
}

func (l *LocalFileStorageService) UploadFile(filePath string, fileName string) (string, error) {
	return "", nil
}
