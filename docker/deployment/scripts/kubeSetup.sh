#!/bin/bash
MONGO=deploy/db
APPPOD=$(kubectl get pods --selector='app=app' -o name | sed -e s'/pod\///')
MONGOPOD=$(kubectl get pods --selector='app=db' -o name | sed -e s'/pod\///')

# install SSH and rsync; also start the SSH service
echo Installing SSH on pod $APPPOD
kubectl exec -c app $APPPOD -- bash -c "apt-get update \
&& apt-get install -y openssh-server openssh-client rsync \
&& mkdir -p -m 700 /root/.ssh \
&& service ssh start"

# add my public key to the container so I can "ssh root@localhost"
# --no-preserve=true keeps the permissions intact for root on the container side
kubectl cp -c app ~/.ssh/authorized_keys $APPPOD:/root/.ssh/authorized_keys --no-preserve=true
