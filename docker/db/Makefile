clean:
	docker compose down

db:
	docker compose up -d db

dump: db
	docker compose exec db mongodump
	docker compose cp db:/dump ./dump

restore: db
	docker compose cp ./dump db:/dump
	docker compose exec db mongorestore

