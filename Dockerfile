ARG DOCKER_BASEIMAGE
FROM ${DOCKER_BASEIMAGE}

ARG APP_DIR
ENV APP_DIR=${APP_DIR:-/srv/df-exporter}

ARG PORT
ENV PORT=${PORT:-8080}

COPY main.js ${APP_DIR}/
COPY package.json ${APP_DIR}/

COPY assets/ /
RUN chmod +x /usr/local/sbin/*.sh

WORKDIR ${APP_DIR}

RUN npm i
EXPOSE ${PORT}

ENTRYPOINT [ "/usr/local/sbin/init.sh" ]
