package middleware

import "net/http"

// AuthPlaceholder is a middleware that acts as a placeholder for authentication.
// For V1, it just logs and passes the request down the chain.
func AuthPlaceholder(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Place for future authorization token check:
		// token := r.Header.Get("Authorization")
		// ...
		// We could inject a dummy user ID in request context:
		// ctx := context.WithValue(r.Context(), "user_id", "default-user-id")
		// r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
