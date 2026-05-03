package application

// DeleteContentInput is used by the delete use case (implemented in commit 4).
type DeleteContentInput struct {
	UserID    string
	ContentID string
}
