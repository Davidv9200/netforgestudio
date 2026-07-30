# Multi-stage build for NetForge Studio
# Stage 1: Build the static web app using Node.js
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Express Production Backend + Persistent Data Storage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY server.js ./

# Create data directory for volume mounting
RUN mkdir -p /app/data/projects

EXPOSE 80
CMD ["node", "server.js"]
