# https://docs.docker.com/compose/reference/overview

start: db

.PHONY: db
db: # admin-ui http://localhost:81
	docker-compose up -d db
	docker-compose up -d db-admin-ui

.PHONY: phptest
phptest: # for troublehsooting, currently drops you into the container
	docker-compose run php-test bash

.PHONY: update
update:
	docker-compose pull

.PHONY: logs
logs:
	docker-compose logs

.PHONY: clean
clean:
	docker-compose kill
	docker-compose rm -f
	docker system prune -f
