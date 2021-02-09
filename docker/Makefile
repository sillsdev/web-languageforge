# https://docs.docker.com/compose/reference/overview

.PHONY: start
start:
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: db
db:
	docker-compose up -d db

.PHONY: ui
ui:
	docker-compose up -d ui

.PHONY: api
api:
	docker-compose up -d api

.PHONY: php-test
php-test:
	docker-compose run php-test
	#docker-compose run php-test bash


.PHONY: ssl
ssl: # http://localhost => https://localhost
	docker-compose up -d ssl

.PHONY: update
update:
	docker-compose pull

.PHONY: logs
logs:
	docker-compose logs

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
