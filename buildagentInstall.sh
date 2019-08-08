#!/bin/sh

PRIVATE_ANSIBLE_REPO_PATH=/path/to/the/repo

NC='\033[0m' # No Color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\e[33m'

echo "${YELLOW}Pre-install message:\nThis script is meant to be run on an existing TeamCity build-agent.${NC}"

echo "${GREEN}install Ansible${NC}"
sudo apt install ansible

echo "${GREEN}cd into deploy${NC}"
cd deploy

echo "${GREEN}run Ansible install script:${NC}"
echo "${GREEN}ansible-playbook playbook_bionic.yml --limit build_agents -K${NC}"
ansible-playbook playbook_bionic.yml --skip-tags "developer" --limit ba-web-bionic64.psonet -k -K

echo "${GREEN}cd into the private repo${NC}"
cd PRIVATE_ANSIBLE_REPO_PATH

echo "${GREEN}ansible-playbook playbook_buildagent.yml --limit build_agents -K${NC}"
ansible-playbook playbook_buildagent.yml --limit ba-web-bionic64.psonet -k -k
