# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum if they exist (go.sum doesn't exist yet but let's handle it)
COPY go.mod ./
# RUN go mod download # we don't have dependencies yet

COPY . .

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy the binary
COPY --from=builder /app/server .

# Copy prompts template (since we need them for LLM proxy)
COPY --from=builder /app/prompts ./prompts

# Copy migration files
COPY --from=builder /app/migrations ./migrations


# Create uploads directory
RUN mkdir -p uploads/metas

# Expose port
EXPOSE 8081

# Command to run the executable
CMD ["./server"]
