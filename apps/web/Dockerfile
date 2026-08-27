# KYVON AI web — development image (hot-reload via bind mount in compose).
# For production, build a separate multi-stage image with `next build` + `next start`.
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

# Install dependencies first for better layer caching.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
