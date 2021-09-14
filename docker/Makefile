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
	docker-compose restart app-for-e2e || docker-compose up -d app-for-e2e
	docker-compose run -e TEST_SPECS=$(TEST_SPECS) test-e2e
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
	docker-compose run -e WEBSITE=languageforge.org --name unittests test-php
	docker cp unittests:/var/www/PhpUnitTests.xml ..
endif

.PHONY: build
build:
	docker-compose build mail app ld-api

.PHONY: scan
# https://docs.docker.com/engine/scan
scan:
	docker build -t lf-app:prod -f app/Dockerfile --platform linux/amd64 ..
	docker login
	-docker scan --accept-license lf-app:prod > docker-scan-results.txt

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
