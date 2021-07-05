#!/bin/bash
MONGO=db-d8fd84c89-vjs7j
APP=app-7c76db448d-sq5st
CONTAINER=$APP

# install SSH and rsync; also start the SSH service
kubectl exec $CONTAINER -- bash -c "apt-get update \
&& apt-get install -y openssh-server openssh-client rsync \
&& mkdir -m 700 /root/.ssh \
&& service ssh start"

# add my public key to the container so I can "ssh root@localhost"
# --no-preserve=true keeps the permissions intact for root on the container side
kubectl cp ~/.ssh/authorized_keys $CONTAINER:/root/.ssh/authorized_keys --no-preserve=true
