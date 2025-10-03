package managerapi

import (
	"encoding/json"
	"net/http"
)

// CopyHeader copies HTTP headers from src to dst
func CopyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

// SetCorsHeaders applies detailed CORS headers
func SetCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}

// CorsMiddleware wraps a handler to always set CORS headers
func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		SetCorsHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// JSONResponse writes JSON with Content-Type and status code
func JSONResponse(w http.ResponseWriter, v interface{}, status int) {
	SetCorsHeaders(w)
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	if status == 0 {
		status = http.StatusOK
	}
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// JSONError writes a JSON error response
func JSONError(w http.ResponseWriter, msg string, status int) {
	SetCorsHeaders(w)
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
