# How to deploy

Various scenarios and what to do.

## Initial deployment

Nothing exists, and we want to bring something up.

1. Create a TLS certificate and put it in a secret called `languageforge-tls`
1. Edit `app-deployment.yaml` as follows:
    - Change all copies of `qa-languageforge` to `languageforge`
    - Change all copies of `qa.languageforge` to `languageforge`
1. Run `make deploy-mail-prod`
1. Run `make deploy-db`
1. Run `make deploy-app-prod`

## Deploying new features or bugfixes

Language Forge is up and running, and we want to deploy new features and/or bugfixes

1. Ensure the LF version number is updated
    - TODO: Discuss in standup how we're going to tag version numbers
1. Run `make deploy-app-prod`
