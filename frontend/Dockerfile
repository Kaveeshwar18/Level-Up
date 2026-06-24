# Stage 1: Build React SPA
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install packages
RUN npm install

# Copy frontend source files
COPY . .

# Inject build-time environment variable so that the app uses Nginx's relative /api proxy path
ENV VITE_API_URL=/api

# Build static assets for production
RUN npm run build

# Stage 2: Serve React SPA via Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
