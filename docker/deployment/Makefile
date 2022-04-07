# https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands
list-services:
	kubectl get services

list-deployments:
	kubectl get deployments

logs: logs-app logs-db logs-mail
logs-app:
	kubectl logs deploy/app
logs-db:
	kubectl logs deploy/db
logs-mail:
	kubectl logs deploy/mail

retrieve-current-deployments:
	kubectl get deploy app  -o yaml > app-deployment-current.yaml
	kubectl get deploy mail -o yaml > mail-deployment-current.yaml
	kubectl get deploy db   -o yaml > db-deployment-current.yaml

shell-app:
	kubectl exec -it deploy/app -- sh

init-secrets:
	kubectl apply -f secrets.yaml

create-new-deployment-mail:
	kubectl create deployment mail --image=juanluisbaptiste/postfix:1.0.0 --dry-run=client -o yaml > mail-deployment-new.yaml

deploy-staging: deploy-db deploy-mail-staging deploy-app-staging deploy-next-proxy-staging deploy-next-app-staging
deploy-mail-staging:
	sed -e s/{{SERVER_HOSTNAME}}/qa.languageforge.org/ mail-deployment.yaml | kubectl apply -f -
deploy-app-staging:
	sed -e s/{{WEBSITE}}/qa.languageforge.org/ app-deployment.yaml \
  | sed -e s/{{VERSION}}/$(VERSION_APP)/ | kubectl apply -f -
deploy-next-proxy-staging:
	sed -e s/{{WEBSITE}}/qa.languageforge.org/ next-proxy-deployment.yaml \
  | sed -e s/{{VERSION}}/$(VERSION_PROXY)/ | kubectl apply -f -
deploy-next-app-staging:
	sed -e s/{{VERSION}}/$(VERSION_NEXT_APP)/ next-app-deployment.yaml | kubectl apply -f -
deploy-prod: deploy-db deploy-mail-prod deploy-app-prod
deploy-mail-prod:
	sed -e s/{{SERVER_HOSTNAME}}/languageforge.org/ mail-deployment.yaml | kubectl apply -f -
deploy-app-prod:
	sed -e s/{{WEBSITE}}/languageforge.org/ app-deployment.yaml \
  | sed -e s/{{VERSION}}/$(VERSION)/ | kubectl apply -f -
deploy-db:
	kubectl apply -f db-deployment.yaml

delete: delete-app delete-mail delete-db delete-next-proxy delete-next-app
delete-db: # does NOT delete the volume, i.e., the data in the database
	kubectl delete deployment,service db
delete-db-data:
	kubectl delete pvc lf-mongo-data
delete-mail:
	kubectl delete deployment,service mail
delete-app: # does NOT delete the volumes, e.g., the project assets like pictures and audio files
	kubectl delete deployment,service app
delete-app-assets:
	kubectl delete pvc lf-project-assets
delete-app-sendreceive-data:
	kubectl delete pvc lfmerge-sendreceive-data
delete-next-proxy:
	kubectl delete deployment,service next-proxy
	kubectl delete ingress languageforge-app
delete-next-app:
	kubectl delete deployment,service next-app

APPPOD = $(shell kubectl get pods --selector='app=app' -o name | sed -e s'/pod\///')
lfmerge-copy-state:
	rm -rf all_projects/*.state on_hold/*.state
	kubectl cp $(APPPOD):/var/lib/languageforge/lexicon/sendreceive/state all_projects
	grep -l HOLD all_projects/*.state | wc | awk '{printf $$1; }' && echo ' projects on HOLD'
	mkdir -p on_hold
	for f in `grep -l HOLD all_projects/*.state`; do mv $$f on_hold; done
