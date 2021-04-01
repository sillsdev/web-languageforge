# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: build
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: e2e-tests
e2e-tests: build
	ifeq($(TEAMCITY_VERSION),$())
		# developer machine
		docker-compose run test-e2e
	else
		# teamcity CI
		docker-compose run -e TEAMCITY_VERSION=TEAMCITY_VERSION test-e2e
	endif

.PHONY: unit-tests
unit-tests: build
	ifeq($(TEAMCITY_VERSION),$())
		# developer machine
		docker-compose run test-php
	else
		# teamcity CI
		docker-compose run --name unittests test-php
		docker cp unittests:/var/www/PhpUnitTests.xml ..
	endif

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
