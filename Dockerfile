FROM ubuntu:bionic

RUN    apt-get update \
    && apt --yes install software-properties-common \
    && apt-add-repository --yes --update ppa:ansible/ansible \
    && apt --yes install git ansible

RUN mkdir -p /data
WORKDIR /data
