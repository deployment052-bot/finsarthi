FROM node:22-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Application port
EXPOSE 5000

# Start application
CMD ["npm", "start"]