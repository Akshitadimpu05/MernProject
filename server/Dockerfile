FROM node:18-alpine

WORKDIR /app

# Install build dependencies, C/C++ compilers, and OpenJDK for Java
RUN apk add --no-cache build-base gcc g++ python3 make openjdk11

# Create directories for temporary files and outputs
RUN mkdir -p /app/temp /app/outputs && chmod 777 /app/temp /app/outputs

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
