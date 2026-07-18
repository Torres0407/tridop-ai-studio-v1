# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first (layer cache)
COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./

# Copy only what's needed for this service + its libs
COPY libs/common ./libs/common
COPY libs/types   ./libs/types
COPY libs/clients ./libs/clients
COPY apps/identity-service ./apps/identity-service

RUN npm ci --ignore-scripts
RUN npx nx build identity-service --prod

# ─── Runtime image ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy production output only
COPY --from=builder /app/dist/apps/identity-service ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main.js"]
