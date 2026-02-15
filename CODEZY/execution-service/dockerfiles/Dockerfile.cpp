# C++ execution environment
FROM gcc:13-bookworm

# Create non-root user for security
RUN useradd -m -u 1000 coderunner

# Set working directory
WORKDIR /app

# Switch to non-root user
USER coderunner

# Default command
CMD ["g++"]
