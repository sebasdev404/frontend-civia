FROM node:24-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -- --webpack
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --gid 10001 civia && useradd --uid 10001 --gid civia --create-home civia
COPY --from=build --chown=civia:civia /app/.next/standalone ./
COPY --from=build --chown=civia:civia /app/.next/static ./.next/static
COPY --from=build --chown=civia:civia /app/public ./public
USER civia
EXPOSE 3000
CMD ["node","server.js"]
