# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Production Stage
FROM nginx:alpine AS runner

# Create pid directory and set ownership for unprivileged execution
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /etc/nginx/conf.d

# Remove default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy built static assets from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

LABEL org.opencontainers.image.title="ErgonPDF" \
      org.opencontainers.image.description="The Open-Source, Privacy-First All-in-One PDF Workspace" \
      org.opencontainers.image.version="1.2.0" \
      org.opencontainers.image.source="https://github.com/CodeSorcerer-007/ErgonPDF"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

