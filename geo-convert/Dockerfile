# Multi-stage build for geo-convert client

# ----------- Base dependencies -----------
FROM node:lts-alpine AS deps
WORKDIR /app
# Copy package.json and lockfile separately for better caching
COPY package.json pnpm-lock.yaml ./
# Enable pnpm via corepack
RUN corepack enable && pnpm install --frozen-lockfile

# ----------- Build stage -----------
FROM node:lts-alpine AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# ----------- Production stage -----------
FROM nginx:lts-alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
