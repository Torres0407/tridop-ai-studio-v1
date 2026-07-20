# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY nx.json ./
COPY webpack.config.js ./
COPY libs/common ./libs/common
COPY libs/types ./libs/types
COPY libs/clients ./libs/clients
COPY apps/billing-service ./apps/billing-service
RUN npm ci --ignore-scripts --legacy-peer-deps --no-audit
RUN npx nx build billing-service --prod

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist/apps/billing-service ./dist
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
