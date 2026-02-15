# Java execution environment
FROM eclipse-temurin:17-jdk-alpine

# Install bash for shell commands
RUN apk add --no-cache bash

# Create non-root user for security
RUN adduser -D -u 1000 coderunner

# Set working directory
WORKDIR /app

# Switch to non-root user
USER coderunner

# Default command
CMD ["java"]
