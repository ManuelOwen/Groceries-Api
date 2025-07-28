# ---------- BUILD ----------
FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy relevant files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig* ./
COPY src ./src


RUN pnpm install --frozen-lockfile
RUN pnpm run build

# ---------- PRODUCTION ----------
FROM node:22-alpine AS production

WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .env ./
RUN pnpm install --frozen-lockfile --prod

# Copy the built output
COPY --from=builder /app/dist ./dist

# Adjust this path based on your actual output
CMD ["node", "dist/main.js"]
