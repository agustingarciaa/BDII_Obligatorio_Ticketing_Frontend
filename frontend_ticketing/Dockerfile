# Build context is the repo root (npm workspace), not this folder.
# docker build -f frontend_ticketing/Dockerfile .

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend_ticketing/package.json frontend_ticketing/package.json
# npm ci can skip platform-specific optional deps (native binaries) when the
# lockfile was generated on a different OS (npm/cli#4828); npm install
# re-resolves them for the current platform.
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend_ticketing/node_modules ./frontend_ticketing/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so this
# must be a build arg, not a runtime env var on the running container.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build --workspace=frontend_ticketing

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/frontend_ticketing/public ./frontend_ticketing/public
COPY --from=builder --chown=nextjs:nodejs /app/frontend_ticketing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend_ticketing/.next/static ./frontend_ticketing/.next/static

USER nextjs
EXPOSE 3001

CMD ["node", "frontend_ticketing/server.js"]
