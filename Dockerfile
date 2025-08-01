# ------------------ BUILD ------------------
    FROM node:22-alpine AS builder

    RUN npm install -g pnpm

    WORKDIR /app

    COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
    RUN pnpm install --frozen-lockfile

    COPY . .
    RUN pnpm run build

    # ------------------ PRODUCTION ------------------
    FROM node:22-alpine AS production

    RUN npm install -g pnpm

    WORKDIR /app

    COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
    RUN pnpm install --frozen-lockfile --prod

    COPY --from=builder /app/dist ./dist

    CMD ["node", "dist/main.js"]