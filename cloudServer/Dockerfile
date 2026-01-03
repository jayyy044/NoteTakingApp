# Use official Node.js image
FROM node:18-alpine

# Create app directory in container
WORKDIR /app

# Copy package files first (better for Docker caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all app source code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run the app (uses the "start" script from package.json)
CMD ["npm", "start"]