FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json tsconfig.json ./

# Cài đặt dependencies
RUN pnpm install

# Copy mã nguồn
COPY src/ ./src/
COPY sql/ ./sql/

# Build TypeScript sang JavaScript
RUN pnpm build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --prod

# Copy compiled code từ builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sql ./sql

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/server.js"]
