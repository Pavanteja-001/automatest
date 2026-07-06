# Must match the @playwright/test version in package.json exactly, or the
# browser binaries/driver bundled in this image won't match what the test
# runner expects.
FROM mcr.microsoft.com/playwright:v1.61.1-noble

# Virtual display + browser-in-browser streaming, so headed/recording sessions
# (which need a real display) can be watched remotely via the /vnc route.
RUN apt-get update \
    && apt-get install -y --no-install-recommends xvfb x11vnc novnc websockify \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

COPY src ./src
COPY tsconfig.json playwright.config.ts ./

RUN npm run build

COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

ENV NODE_ENV=production
ENV DISPLAY=:99

ENTRYPOINT ["./docker/entrypoint.sh"]
