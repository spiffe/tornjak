package db

import (
	"fmt"
)

// SQLError is an error where the input appears correct but the database acts up
type SQLError struct {
	Cmd string
	Err error
}

func (e SQLError) Error() string {
	return fmt.Sprintf("Unable to execute SQL query %v: %v", e.Cmd, e.Err.Error())
}

// GetError is an error intended to signify something wrong with a get request
// For example, non-existence
type GetError struct {
	Message string
}

func (e GetError) Error() string {
	return e.Message
}

// PostFailure is meant to signify when the state of the database has not changed
type PostFailure struct {
	Message string
}

func (e PostFailure) Error() string {
	return e.Message
}
