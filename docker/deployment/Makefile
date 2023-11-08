# https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands
list-deployments:
	kubectl get deployments
list-services:
	kubectl get services
list-pods:
	kubectl get pods
list-contexts:
	kubectl config get-contexts
list-config:
	cat ~/.kube/config

logs: logs-app logs-lfmerge logs-db logs-mail logs-next-app logs-next-proxy
logs-app:
	kubectl logs deploy/app
logs-lfmerge:
	kubectl logs deploy/lfmerge
logs-next-app:
	kubectl logs deploy/next-app
logs-next-proxy:
	kubectl logs deploy/next-proxy
logs-db:
	kubectl logs deploy/db
logs-mail:
	kubectl logs deploy/mail

shell-app:
	kubectl exec -it deploy/app -- sh
shell-db:
	kubectl exec -it deploy/db -- sh
shell-lfmerge:
	kubectl exec -it deploy/lfmerge -- sh
shell-next-app:
	kubectl exec -it deploy/next-app -- sh
shell-next-proxy:
	kubectl exec -it deploy/next-proxy -- sh

forward-db:
	kubectl port-forward pod/db-6b494cd89f-whfr7 27018:27017 -n languageforge

init-secrets:
	kubectl apply -f secrets.yaml

create-new-deployment-mail:
	kubectl create deployment mail --image=juanluisbaptiste/postfix:1.0.0 --dry-run=client -o yaml > mail-deployment-new.yaml

deploy-staging:
	kubectl --context dallas-rke apply -k staging/
deploy-prod:
	kubectl --context aws-rke apply -k prod/


delete: delete-app delete-lfmerge delete-mail delete-db delete-next-proxy delete-next-app
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
delete-lfmerge: # does NOT delete the volumes, e.g., the send/receive webwork folder
	kubectl delete deployment,service lfmerge
delete-next-proxy:
	kubectl delete deployment,service next-proxy
	kubectl delete ingress languageforge-app
delete-next-app:
	kubectl delete deployment,service next-app

scale-down: scale-down-app scale-down-lfmerge scale-down-next-proxy scale-down-next-app scale-down-mail scale-down-db
scale-down-db:
	kubectl scale deploy/db --replicas 0
scale-down-mail:
	kubectl scale deploy/mail --replicas 0
scale-down-app:
	kubectl scale deploy/app --replicas 0
scale-down-lfmerge:
	kubectl scale deploy/lfmerge --replicas 0
scale-down-next-app:
	kubectl scale deploy/next-app --replicas 0
scale-down-next-proxy:
	kubectl scale deploy/next-proxy --replicas 0
scale-up: scale-up-db scale-up-next-proxy scale-up-next-app scale-up-mail scale-up-app scale-up-lfmerge
scale-up-db:
	kubectl scale deploy/db --replicas 1
scale-up-mail:
	kubectl scale deploy/mail --replicas 1
scale-up-app:
	kubectl scale deploy/app --replicas 1
scale-up-lfmerge:
	kubectl scale deploy/lfmerge --replicas 1
scale-up-next-app:
	kubectl scale deploy/next-app --replicas 1
scale-up-next-proxy:
	kubectl scale deploy/next-proxy --replicas 1

APPPOD = $(shell kubectl get pods --selector='app=app' -o name | sed -e s'/pod\///')
lfmerge-copy-state:
	rm -rf all_projects/*.state on_hold/*.state
	kubectl cp $(APPPOD):/var/lib/languageforge/lexicon/sendreceive/state all_projects
	grep -l HOLD all_projects/*.state | wc | awk '{printf $$1; }' && echo ' projects on HOLD'
	mkdir -p on_hold
	for f in `grep -l HOLD all_projects/*.state`; do mv $$f on_hold; done
