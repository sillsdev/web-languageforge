# https://docs.docker.com/compose/reference/overview

.PHONY: start
start:
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: test-e2e
test-e2e: build-test-e2e
	docker-compose run test-e2e

.PHONY: build-test-e2e
build-test-e2e: wait
	docker-compose build mail ui-builder app app-for-e2e test-e2e

.PHONY: test-php
test-php: build-test-php
	docker-compose run test-php

.PHONY: build-test-php
build-test-php: wait
	docker-compose build mail ui-builder app test-php

.PHONY: build
build:
	docker-compose build mail ui-builder app

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
