FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
RUN pnpm install

COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

RUN pnpm build

# Stage 2: Serve với Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Cấu hình Nginx fallback cho React SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:5000/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
