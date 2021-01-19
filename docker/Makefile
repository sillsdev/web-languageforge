# https://docs.docker.com/compose/reference/overview

.PHONY: start
start:
	docker-compose --project-name=languageforge up -d

.PHONY: db
db: # admin-ui http://localhost:81
	docker-compose up -d db
	docker-compose up -d db-admin-ui

.PHONY: php-test
php-test:
	docker-compose --project-name=languageforge run php-test
	#docker-compose run php-test bash

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
    # by default volumes are not pruned.  To prune volumes as well, do:
    # docker system prune -f --volumes
