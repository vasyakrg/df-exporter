ARG DOCKER_BASEIMAGE
FROM ${DOCKER_BASEIMAGE}

ARG DOCKER_MAINTAINER
LABEL maintainer="${DOCKER_MAINTAINER:-vasyakrg@ya.ru}"

RUN apt-get update && \
		apt-get install -y apt-transport-https ca-certificates wget curl software-properties-common gnupg2 && \
		apt-get update && \
		apt-get clean && \
		rm -rf /var/lib/apt/lists/*

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
