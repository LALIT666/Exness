FROM oven/bun:latest

WORKDIR /home

RUN bun install -g serve

COPY package.json bun.lockb* ./
RUN bun install

COPY . .

# Build process
RUN bun run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]