# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
COPY webpack.config.js ./


RUN npm ci --ignore-scripts --legacy-peer-deps --no-audit

COPY libs/common  ./libs/common
COPY libs/types   ./libs/types
COPY libs/clients ./libs/clients
COPY apps/api-gateway ./apps/api-gateway

RUN npx nx build api-gateway --prod

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/dist/apps/api-gateway ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/main.js"]
