# DEPLOY 6 - 2026-06-01 00:19:37 UTC - 2026-06-01 00:15:24 UTC - 2026-06-01 00:14:22 UTC - 2026-06-01 00:06:16 UTC - 2026-06-01 00:05:00 UTC
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>r.json()).then(d=>process.exit(d.status==='ok'?0:1)).catch(()=>process.exit(1))"

CMD ["node", "build"]
