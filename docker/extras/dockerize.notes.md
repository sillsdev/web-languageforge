https://github.com/sillsdev/web-languageforge/issues/805

# Approach 1
## According to README, this project needs ubuntu 18.04
image ref: https://hub.docker.com/_/ubuntu for 18.04, called bionic

`docker run -it ubuntu:bionic bash`

```bash
root@6ae2e9487cad:/# uname -a
Linux 6ae2e9487cad 4.19.121-linuxkit #1 SMP Tue Dec 1 17:50:32 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```

## install deps
`root@6ae2e9487cad:/# apt update` ✅

`root@6ae2e9487cad:/# apt --yes install software-properties-common` ✅

`root@6ae2e9487cad:/# apt-add-repository --yes --update ppa:ansible/ansible` ✅

`root@6ae2e9487cad:/# apt --yes install git ansible` ✅

1. created Dockerfile with these installs
1. `docker build -t lf . `
1. TODO: will need to think through a .dockerignore file (image already 420 MB)

## install project's codebase
`root@6ae2e9487cad:/# mkdir -p src/xForge` ✅

`root@6ae2e9487cad:/# cd src/xForge` ✅

`root@6ae2e9487cad:/# git clone https://github.com/sillsdev/web-languageforge --recurse-submodules` ✅

1. Run from within project root: `docker run -v `pwd`:/data --rm lf ls`
1. TODO: need to figure out how to best handle this submodule thing: should we use instructions in the README to ensure the repo is cloned like this `git clone https://github.com/sillsdev/web-languageforge --recurse-submodules` or is there something we can do to keep that overhead off the dev by doing it in image or container via entrypoint.sh `git submodule update --init --recursive`...not sure how to best deal with this right now so went ahead and just copied things in for now, imaage is now 1.03 GB!!!  Need to talk through this a bit, is ansible part of the env set up and thenother scripts are responsible for starting things or is the ansible script setting the environment up and responsible for starting things up?

## configure ansible
`root@6ae2e9487cad:/src/xForge# cd web-languageforge/deploy` ✅


TODO: stuck here for the moment...
`root@6ae2e9487cad:/src/xForge# ansible-playbook playbook_bionic.yml --limit localhost -K` ❌  => 

```bash

```
