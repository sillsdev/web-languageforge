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

create-new-deployment-mail:
	kubectl create deployment mail --image=juanluisbaptiste/postfix:1.0.0 --dry-run=client -o yaml > mail-deployment-new.yaml

deploy-staging: deploy-db deploy-mail-staging deploy-app-staging
deploy-mail-staging:
	sed -e s/{{SERVER_HOSTNAME}}/qa.languageforge.org/ mail-deployment.yaml | kubectl apply -f -
deploy-app-staging:
	sed -e s/{{ENVIRONMENT}}/development/ app-deployment.yaml \
  | sed -e s/{{WEBSITE}}/qa.languageforge.org/ | kubectl apply -f -

	# this unfortunate hack is required to ensure the image is pulled, this is necessary because we don't tag our images properly, i.e., it's always :app-staging, 
	# therefore the configuration may look unchanged to k8s even though the published image is actually different and needs to be pulled again
	kubectl rollout restart deploy app
deploy-prod: deploy-db deploy-mail-prod deploy-app-prod
deploy-mail-prod:
	sed -e s/{{SERVER_HOSTNAME}}/beta.languageforge.org/ mail-deployment.yaml | kubectl apply -f -

deploy-app-prod:
	sed -e s/{{ENVIRONMENT}}/production/ app-deployment.yaml \
  | sed -e s/{{WEBSITE}}/beta.languageforge.org/ | kubectl apply -f -

	# this unfortunate hack is required to ensure the image is pulled, this is necessary because we don't tag our images properly, i.e., it's always :app-staging, 
	# therefore the configuration may look unchanged to k8s even though the published image is actually different and needs to be pulled again
	kubectl rollout restart deploy app

deploy-db:
	kubectl apply -f db-deployment.yaml

delete: delete-app delete-mail delete-db
delete-db: # does NOT delete the volume, i.e., the data in the database
	kubectl delete deployment,service db
delete-db-data:
	kubectl delete pvc lf-mongo-data
delete-mail:
	kubectl delete deployment,service mail
delete-app: # does NOT delete the volumes, e.g., the project assets like pictures and audio files
	kubectl delete deployment,service app
	kubectl delete ingress languageforge-app
delete-app-assets:
	kubectl delete pvc lf-project-assets
delete-app-sendreceive-data:
	kubectl delete pvc lfmerge-sendreceive-data

	
