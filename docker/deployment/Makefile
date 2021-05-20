# https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands
.PHONY: list-services
list-services:
	kubectl get services

.PHONY: list-deployments
list-deployments:
	kubectl get deployments

.PHONY: logs
logs: logs-app logs-db logs-mail
.PHONY: logs-app
logs-app:
	kubectl logs deploy/app
.PHONY: logs-db
logs-db:
	kubectl logs deploy/db
.PHONY: logs-mail
logs-mail:
	kubectl logs deploy/mail

.PHONY: retrieve-current-deployments
retrieve-current-deployments:
	kubectl get deploy app  -o yaml > app-deployment-current.yaml
	kubectl get deploy mail -o yaml > mail-deployment-current.yaml
	kubectl get deploy db   -o yaml > db-deployment-current.yaml

.PHONY: create-new-deployment-mail
create-new-deployment-mail:
	kubectl create deployment mail --image=juanluisbaptiste/postfix:1.0.0 --dry-run=client -o yaml > mail-deployment-new.yaml

.PHONY: deploy-qa
deploy-qa: deploy-mail-qa deploy-app-qa deploy-db
.PHONY: deploy-mail-qa
deploy-mail-qa:
	sed -e s/{{SERVER_HOSTNAME}}/qa.languageforge.org/ mail-deployment.yaml | kubectl apply -f -
.PHONY: deploy-mail-prod
deploy-mail-prod:
	sed -e s/{{SERVER_HOSTNAME}}/languageforge.org/ mail-deployment.yaml | kubectl apply -f -
.PHONY: deploy-app-qa
deploy-app-qa:
	sed -e s/{{ENVIRONMENT}}/development/ app-deployment.yaml \
  | sed -e s/{{WEBSITE}}/qa.languageforge.org/ | kubectl apply -f -
.PHONY: deploy-app-prod
deploy-app-prod:
	sed -e s/{{ENVIRONMENT}}/production/ app-deployment.yaml \
  | sed -e s/{{WEBSITE}}/languageforge.org/ | kubectl apply -f -
.PHONY: deploy-db
deploy-db:
	kubectl apply -f db-deployment.yaml

.PHONY: delete
delete: delete-app delete-mail delete-db
.PHONY: delete-db
delete-db: # does NOT delete the volume, i.e., the data in the database
	kubectl delete deployment,service db
.PHONY: delete-db-data
delete-db-data:
	kubectl delete pvc lf-mongo-data
.PHONY: delete-mail
delete-mail:
	kubectl delete deployment,service mail
.PHONY: delete-app
delete-app:
	kubectl delete deployment,service app
	kubectl delete ingress languageforge-app
