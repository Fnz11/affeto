FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install
COPY . .
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
COPY --from=builder /app /app
EXPOSE 4321
CMD ["bun", "run", "./dist/server/entry.mjs"]
