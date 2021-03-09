# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: wait
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: e2e
e2e: wait
	docker-compose build ui api
	docker-compose run e2e-ui

.PHONY: tests
tests:
	docker-compose run test-api

.PHONY: build
build: wait
	docker-compose build

.PHONY: wait
wait:
	docker build -t wait wait/.

.PHONY: db-reset
db-reset:
	docker-compose run db-reset

.PHONY: logs
logs:
	docker-compose logs

.PHONY: clean
clean:
	docker-compose down -t 1
	docker system prune -f

.PHONY: clean-volumes
clean-volumes:
	docker-compose down -t 1 -v
	docker system prune -f --volumes

.PHONY: clean-powerwash
clean-powerwash: clean-volumes
	docker-compose down -t 1 --rmi all
	docker rmi wait
