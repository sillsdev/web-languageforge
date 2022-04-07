# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: build
    # starts the entire runtime infrastructure
	docker-compose up -d ssl

.PHONY: dev
dev: start
	docker-compose up -d ui-builder

.PHONY: e2e-tests
e2e-tests:
	docker-compose build app-for-e2e test-e2e
	docker-compose restart app-for-e2e || docker-compose up -d app-for-e2e
	docker-compose run -e TEST_SPECS=$(TEST_SPECS) test-e2e

.PHONY: e2e-tests-ci
e2e-tests-ci:
	docker-compose build app-for-e2e test-e2e
	docker-compose run -e GITHUB_ACTIONS=1 --name e2etests test-e2e
	docker cp e2etests:/data/e2e-output/junitresults.xml e2e-results.xml
	docker rm e2etests

.PHONY: unit-tests
unit-tests:
	docker-compose run test-php

.PHONY: unit-tests-ci
unit-tests-ci:
	docker-compose run --name unittests test-php
	docker cp unittests:/var/www/PhpUnitTests.xml .
	docker rm unittests

.PHONY: build
build:
	npm install
	docker-compose build mail app ld-api next-proxy next-app

.PHONY: scan
# https://docs.docker.com/engine/scan
scan:
	docker build -t lf-app:prod -f app/Dockerfile --platform linux/amd64 ..
	docker login
	-docker scan --accept-license lf-app:prod > docker-scan-results.txt

.PHONY: next-dev
next-dev: build
	docker compose up -d next-proxy-dev

.PHONY: build-next
build-next:
	docker compose build next-proxy next-app

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
