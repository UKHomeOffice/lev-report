FROM node:16-alpine

RUN apk add --no-cache \
      ca-certificates \
      g++ \
      make \
      python3 \
 && apk update \
 && apk upgrade --no-cache \
 && addgroup -S app \
 && adduser -S app -G app -u 31337 -h /app/ \
 && chown -R app:app /app/

USER app
WORKDIR /app
ENV NODE_ENV production

COPY --chown=app:app *node_modules/ package.json package-lock.json /app/
RUN npm install --omit=dev --legacy-peer-deps > .npm-install.log 2>&1 \
 && rm .npm-install.log \
 || ( EC=$?; cat .npm-install.log; exit $EC )

COPY --chown=app:app assets/ /app/assets/
COPY --chown=app:app pages/ /app/pages/
COPY --chown=app:app src/ /app/src/
COPY --chown=app:app rds-combined-ca-bundle.pem /app/

RUN npm run postinstall

USER root
RUN apk del --no-cache \
      g++ \
      make \
      python3

USER 31337
ENV LISTEN_HOST="0.0.0.0" \
    LISTEN_PORT="4000" \
    POSTGRES_HOST="localhost" \
    POSTGRES_PORT="5432" \
    POSTGRES_DB="lev" \
    POSTGRES_USER="lev" \
    POSTGRES_PASSWORD="lev" \
    NODE_EXTRA_CA_CERTS="/app/rds-combined-ca-bundle.pem"
CMD ["node", "."]
