#!/bin/bash

VERSION=$(cat VERSION)
DOCKER_BASEIMAGE=node:17

docker buildx build --platform linux/amd64,linux/arm64 --push -t vasyakrg/df-exporter:${VERSION} --build-arg DOCKER_BASEIMAGE=${DOCKER_BASEIMAGE} .
