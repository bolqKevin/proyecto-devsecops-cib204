FROM node:20.20.2-bookworm-slim AS build

RUN apt-get update \
  && apt-get dist-upgrade -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY *.js ./

FROM node:20.20.2-bookworm-slim

WORKDIR /app
RUN apt-get update \
  && apt-get dist-upgrade -y --no-install-recommends \
  && useradd --system --no-create-home --shell /usr/sbin/nologin appuser \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /opt/yarn-v1.22.22 \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack
COPY --from=build /app /app
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
CMD ["node", "servidor.js"]
