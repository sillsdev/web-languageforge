# https://docs.docker.com/compose/reference/overview

.PHONY: start
start:
	docker-compose up -d

.PHONY: db
db: # admin-ui http://localhost:81
	docker-compose up -d db
	docker-compose up -d db-admin-ui

.PHONY: php-test
php-test:
	docker-compose run php-test
	#docker-compose run php-test bash

.PHONY: php-api
php-api:
	docker-compose up -d php-api

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
	docker-compose up -d db
	docker-compose up -d mail
	sleep 5
	docker run -w /var/www/scripts/tools -v `pwd`/../scripts:/var/www/scripts --network=docker_default lf-php-api php FactoryReset.php run

.PHONY: clean
clean:
	docker-compose kill
	docker-compose rm -f
	docker system prune -f
  # by default volumes are not pruned.  To prune volumes as well, do:
  # docker system prune -f --volumes
