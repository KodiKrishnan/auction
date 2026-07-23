# syntax=docker/dockerfile:1

# Build stage: Node, npm cache, and source files never enter the runtime image.
FROM node:22-alpine AS builder

WORKDIR /app

# Keep dependency installation in a cacheable layer. The cache mount speeds up
# rebuilds without adding npm's cache to any image layer.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Copy only the files Vite needs. In particular, do not copy .env files into
# the build context; public VITE_ values must be passed explicitly below.
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

ARG VITE_API_GOOGLE_KEY
ENV VITE_API_GOOGLE_KEY=${VITE_API_GOOGLE_KEY}

RUN npm run build

# The unprivileged nginx image has no package manager and runs as a non-root
# user. It serves on 8080 because non-root processes cannot bind port 80.
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
