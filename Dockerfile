# Use official Node.js image as base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port (default Next.js port)
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start"]
