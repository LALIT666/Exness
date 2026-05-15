FROM node:22-alpine

WORKDIR /app

# 🔥 Mac/Prisma Fix: Alpine ke liye zaruri dependency
RUN apk add --no-cache libc6-compat

# Bun install karo
RUN npm install -g bun

# package files copy karo
COPY package.json bun.lockb* ./
RUN bun install

# Prisma folders copy karke client generate karo
COPY prisma ./prisma
RUN npx prisma generate

# Baki code copy karo
COPY . .

# Start command
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && bun run src/index.ts"]