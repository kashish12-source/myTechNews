# Stage 1: Build static assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configurations first to cache dependency install layer
COPY package.json package-lock.json ./

# Install dependencies using clean install (npm ci)
RUN npm ci

# Copy client codebase
COPY . .

# Compile TypeScript and bundle with Vite
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy compiled production assets from builder stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default Nginx server configuration with custom proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
