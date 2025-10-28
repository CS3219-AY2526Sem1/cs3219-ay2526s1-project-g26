#!/bin/bash

# Script to run peerprep dev or prod
# Usage: ./run.sh dev
#        ./run.sh prod

MODE=$1

if [ -z "$MODE" ]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

stop_containers() {
  echo "Stopping existing containers..."
  docker-compose -f "$1" down
}

case $MODE in
  dev)
    echo "Starting peerprep in development mode..."
    stop_containers docker-compose.dev.yml
    docker-compose -f docker-compose.dev.yml up --build -d
    ;;
  prod)
    echo "Starting peerprep in production mode..."
    stop_containers docker-compose.prod.yml
    docker-compose -f docker-compose.prod.yml up --build -d
    ;;
  *)
    echo "Invalid mode: $MODE"
    echo "Usage: $0 [dev|prod]"
    exit 1
    ;;
esac
