FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production


COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=build /app/dist ./dist


EXPOSE 4000

CMD ["node", "dist/server.js"]