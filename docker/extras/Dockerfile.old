FROM ubuntu:bionic

# TODO: think through optimizations here once this is working.
RUN    apt-get update \
    && apt --yes install software-properties-common \
    && apt-add-repository --yes --update ppa:ansible/ansible \
    && apt --yes install git ansible

# make a working area, an "app" area
RUN mkdir -p /data
WORKDIR /data

# go ahead and pull local filesystem in so we can take care of more manual configs
# TODO: need to optimize this by only copying things that are needed for the set up
COPY . /data

# not sure whether to handle this outside of this image, i.e., tell user to git clone ... --recurse-submodules, or just do it here to make sure the submodules are guaranteed to be here for ansible scripts...
RUN git submodule update --init --recursive

# time to run the ansible scripts
WORKDIR /data/deploy

# TODO: need to make a distinction between environment setup commands and those commands meant for running the services.
# TODO: left off the -K otherwise this command becomes interactive (password requested)
# RUN ansible-playbook playbook_bionic.yml --limit localhost

# troubleshooting latest failure...
# `docker-compose run --rm lf bash` will get you into container
# `ansible-playbook playbook_bionic.yml --limit localhost` (with or without -K not relevant afaik at this point but bash-ing into the container will provide the opportunity to run with the -K (just enter at prompt))
