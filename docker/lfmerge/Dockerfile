FROM ubuntu:bionic

RUN apt update && apt install curl \
&& curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg > /etc/apt/trusted.gpg.d/sil-testing.gpg \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt update

RUN apt install -y lfmerge
