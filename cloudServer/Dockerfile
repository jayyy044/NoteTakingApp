# Use official Node.js LTS image (Alpine for smaller size)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better for Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port 3000 (matches your compose file)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]