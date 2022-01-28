FROM ubuntu:18.04

RUN apt-get update -y
RUN apt-get upgrade -y

RUN apt-get install -y \
		ca-certificates \
		g++ \
		make \
		python3

USER app
WORKDIR /app
ENV NODE_ENV production

COPY --chown=app:app *node_modules/ package.json package-lock.json /app/
RUN npm install --only production > .npm-install.log 2>&1 \
 && rm .npm-install.log \
 || ( EC=$?; cat .npm-install.log; exit $EC )

COPY --chown=app:app assets/ /app/assets/
COPY --chown=app:app pages/ /app/pages/
COPY --chown=app:app src/ /app/src/
COPY --chown=app:app rds-combined-ca-bundle.pem /app/

RUN npm run postinstall

#USER root
#RUN apk del --no-cache \
#      g++ \
#      make \
#      python3

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
