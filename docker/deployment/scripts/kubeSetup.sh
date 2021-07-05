#!/bin/bash
MONGO=db-d8fd84c89-vjs7j
APP=app-7c76db448d-sq5st
CONTAINER=$APP

kubectl exec $CONTAINER -- bash -c "apt-get update \
&& apt-get install -y openssh-server openssh-client rsync \
&& mkdir -m 700 /root/.ssh \
&& service ssh start"
kubectl cp ~/.ssh/authorized_keys $CONTAINER:/root/.ssh/authorized_keys --no-preserve=true
