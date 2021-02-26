# https://docs.docker.com/compose/reference/overview

.PHONY: start
start: wait
  # starts the entire runtime infrastructure
	docker-compose up -d ssl && docker-compose logs -f ui

.PHONY: e2e
e2e:
	docker-compose run e2e-ui

.PHONY: tests
tests:
	docker-compose run --name phptests test-api

	# copy test results out of container for use by teamcity
	docker cp phptests:/var/www/PhpUnitTests.xml ..

.PHONY: build
build: wait
	docker-compose build

.PHONY: db-reset
db-reset:
	docker-compose run db-reset

.PHONY: wait
wait:
	docker build -t wait wait/.

.PHONY: clean
clean:
	docker-compose kill
	docker-compose rm -f
	docker system prune -f
  # by default volumes are not pruned.  To prune volumes as well, do:
  # docker system prune -f --volumes
