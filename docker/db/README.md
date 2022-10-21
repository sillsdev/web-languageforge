# Creating and utilizing any test data

## Create a dump

1. start the app
1. create all the data you want through the app
1. `make dump clean` to create a `dump` folder in this directory
1. `tar -cf <name-representative-of-data>.tar dump`, e.g., `tar -cf activity.tar dump`, and decide whether to commit this or not for others to use.

## Load a dump

1. `tar -xf <name-representative-of-data>.tar` and rename to `dump`
1. `make restore clean` to load the `dump` directory

# Common mongo commands

> https://www.mongodb.com/docs/v4.4/mongo

`mongo` within `db` container

> https://www.mongodb.com/docs/manual/reference/mongo-shell/#command-helpers

`show dbs`

`use scriptureforge`

`show collections`

`exit`

> https://www.mongodb.com/docs/manual/reference/mongo-shell/#queries

`db.users.find()`

# Test data

## Activity

| username | email               | password      | project   |
| -------- | ------------------- | ------------- | --------- |
| admin    | admin@example.com   | password      | all       |
| johndoe  | jd@example.org      | languageforge | project-1 |
| janedoe  | janedoe@example.org | languageforge | project-2 |
