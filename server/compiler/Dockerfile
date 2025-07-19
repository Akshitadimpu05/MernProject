FROM node:18-alpine

WORKDIR /app

# Install necessary compilers and dependencies
RUN apk add --no-cache \
    build-base \
    gcc \
    g++ \
    python3 \
    py3-pip \
    openjdk11 \
    maven

# Create directories for temporary files and outputs
RUN mkdir -p /app/temp /app/outputs && chmod 777 /app/temp /app/outputs

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose the port
EXPOSE 8080

# Start the compiler service
CMD ["node", "compilerService.js"]
