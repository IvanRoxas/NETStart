FROM node:22-bookworm-slim AS deps
WORKDIR /app

COPY frontend-next/package.json frontend-next/package-lock.json* ./
COPY frontend-next/scripts ./scripts
COPY frontend-next/public ./public

RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY frontend-next ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/public/pyodide ./public/pyodide

RUN npx prisma generate
RUN echo 'export default [{ ignores: ["**/*"] }];' > eslint.config.mjs

ARG NEXT_PUBLIC_APP_URL="http://localhost:3000"
ARG NEXT_PUBLIC_HINT_DELAY_LOW=""
ARG NEXT_PUBLIC_HINT_DELAY_MID=""
ARG NEXT_PUBLIC_HINT_DELAY_HIGH=""

ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_HINT_DELAY_LOW=$NEXT_PUBLIC_HINT_DELAY_LOW
ENV NEXT_PUBLIC_HINT_DELAY_MID=$NEXT_PUBLIC_HINT_DELAY_MID
ENV NEXT_PUBLIC_HINT_DELAY_HIGH=$NEXT_PUBLIC_HINT_DELAY_HIGH

RUN npx next build

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/netstart"

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD npx prisma db push --schema=./prisma/schema.prisma && npm run start
