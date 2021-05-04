# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: build
  # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: dev
dev: start
	docker-compose up -d ui-builder

.PHONY: e2e-tests
e2e-tests: build
	docker-compose build app-for-e2e test-e2e
ifeq ($(TEAMCITY_VERSION),$())
	# developer machine
	docker-compose run test-e2e
else
	# teamcity CI
	docker-compose run -e TEAMCITY_VERSION=TEAMCITY_VERSION test-e2e
endif

.PHONY: unit-tests
unit-tests: build
	docker-compose build test-php
ifeq ("$(TEAMCITY_VERSION)",$())
	# developer machine
	docker-compose run test-php
else
	# teamcity CI
	docker-compose run --name unittests test-php
	docker cp unittests:/var/www/PhpUnitTests.xml ..
endif

.PHONY: build
build: build-ui
	docker-compose build mail app ld-api

.PHONY: build-ui
build-ui:
	docker-compose build --build-arg BUGSNAG_API_KEY=${BUGSNAG_API_KEY} ui-builder

.PHONY: deployable-app
deployable-app: build-ui
	docker-compose build app

.PHONY: prod
prod: build-ui
	docker build -f ui-builder/Dockerfile.prod -t lf-ui-builder:prod .

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
