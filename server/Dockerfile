FROM node:18-alpine as builder

WORKDIR /app

# Install build dependencies, C/C++ compilers, and OpenJDK for Java
RUN apk add --no-cache build-base gcc g++ python3 make openjdk11

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Create a fresh image to reduce size
FROM node:18-alpine

WORKDIR /app

# Install runtime dependencies including compilers
RUN apk add --no-cache build-base gcc g++ python3 openjdk11

# Create directories for temporary files and outputs
RUN mkdir -p /app/temp /app/outputs && chmod 777 /app/temp /app/outputs

# Copy node modules and other files from builder stage
COPY --from=builder /app/node_modules /app/node_modules

# Copy application code
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
