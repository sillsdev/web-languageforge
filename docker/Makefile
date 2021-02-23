# https://docs.docker.com/compose/reference/overview

.PHONY: start
start:
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: e2e
e2e:
	docker-compose run e2e-ui

.PHONY: tests
tests:
	docker-compose run test-api

.PHONY: db-reset
db-reset:
	docker-compose run db-reset

.PHONY: clean
clean:
	docker-compose kill
	docker-compose rm -f
	docker system prune -f
  # by default volumes are not pruned.  To prune volumes as well, do:
  # docker system prune -f --volumes
