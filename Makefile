# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: build
	# starts the entire runtime infrastructure
	docker compose up -d ssl

.PHONY: dev
dev: start ui-builder

.PHONY: ui-builder
ui-builder:
	docker compose up -d ui-builder

.PHONY: e2e-tests-ci
e2e-tests-ci:
	pnpm install
	"$(MAKE)" e2e-app
	pnpm exec playwright install ${browser} --with-deps
	pnpm exec playwright test -c ./test/e2e/playwright.config.ts --project=${browser} --shard=${shard}

.PHONY: e2e-tests
e2e-tests: ui-builder
	pnpm install
	"$(MAKE)" e2e-app
	pnpm exec playwright install chromium firefox
	pnpm exec playwright test -c ./test/e2e/playwright.config.ts $(params)

.PHONY: e2e-app
e2e-app:
	# delete any cached session storage state files if the service isn't running
	docker compose ps e2e-app > /dev/null 2>&1 || "$(MAKE)" clean-test
	docker compose up -d e2e-app --build

.PHONY: unit-tests
unit-tests:
	docker compose build test-php
	docker compose run test-php

.PHONY: unit-tests-ci
unit-tests-ci:
	docker compose run --name unittests test-php
	docker cp unittests:/var/www/PhpUnitTests.xml .
	docker rm unittests

.PHONY: build
build:
	pnpm install

	# ensure we start with a clean ui-dist volume for every build
	-docker volume rm web-languageforge_lf-ui-dist 2>/dev/null

	docker compose build mail app lfmerge ld-api next-proxy next-app

.PHONY: scan
# https://docs.docker.com/engine/scan
scan:
	docker build -t lf-app:prod -f docker/app/Dockerfile --platform linux/amd64 .
	docker login
	-docker scan --accept-license lf-app:prod > docker-scan-results.txt

.PHONY: next-dev
next-dev: build
	docker compose up -d next-proxy-dev

.PHONY: build-next
build-next:
	docker compose build next-proxy next-app

.PHONY: build-base-php
build-base-php:
	docker build -t sillsdev/web-languageforge:base-php -f docker/base-php/Dockerfile .

.PHONY: composer-dev
composer-dev:
	docker compose build composer-dev
	docker compose run composer-dev

.PHONY: clean
clean:
	docker compose down
	docker system prune -f

.PHONY: clean-test
clean-test:
	cd test/e2e && pnpm dlx rimraf test-storage-state

.PHONY: clean-powerwash
clean-powerwash: clean
	"$(MAKE)" clean-test
	docker system prune -f --volumes
	- docker rmi -f `docker images -q "lf-*"` sillsdev/web-languageforge:base-php
	docker builder prune -f
