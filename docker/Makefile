# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: wait
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: test-e2e
test-e2e: wait
	docker-compose build ui-builder app
	docker-compose run test-e2e

.PHONY: test-php
test-php:
	docker-compose run test-php

.PHONY: build
build: wait
	docker-compose build

.PHONY: wait
wait:
	docker build -t wait wait/.

.PHONY: db-reset
db-reset: wait
	docker-compose build app
	docker-compose run db-reset

.PHONY: logs
logs:
	docker-compose logs

.PHONY: clean
clean:
	docker-compose down
	docker system prune -f

.PHONY: clean-volumes
clean-volumes:
	docker-compose down -v
	docker system prune -f --volumes

.PHONY: clean-powerwash
clean-powerwash: clean-volumes
	docker-compose down --rmi all
	docker rmi wait
