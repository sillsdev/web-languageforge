# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: build
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: e2e-tests
e2e-tests: build
	docker-compose run test-e2e

.PHONY: unit-tests
unit-tests: build
	docker-compose run test-php

.PHONY: build
build:
	docker-compose build mail ui-builder app

.PHONY: db-reset
db-reset:
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
