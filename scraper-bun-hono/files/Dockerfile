FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json ./
RUN bun install

FROM oven/bun:1
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV SCRAPER_PORT=3021
EXPOSE 3021
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=15s \
  CMD wget -q --spider http://127.0.0.1:3021/health || exit 1
CMD ["bun", "run", "src/server.ts"]
