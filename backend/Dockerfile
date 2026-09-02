FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --ignore-scripts
COPY . .
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 1337
CMD ["bun", "run", "start"]
