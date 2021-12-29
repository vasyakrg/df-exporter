#!/bin/bash
set -e

echo "[ Info ] Run parent entrypoint"
set -- node main.js

echo Args: $@
exec "$@"
