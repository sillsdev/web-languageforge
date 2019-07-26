#!/bin/sh

NC='\033[0m' # No Color
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\e[33m'

echo "${GREEN}install Ansible${NC}"
sudo apt install ansible

echo "${GREEN}cd into deploy${NC}"
cd deploy

echo "${GREEN}run Ansible install script:${NC}"
echo "${GREEN}ansible-playbook playbook_bionic.yml --limit build_agents -K${NC}"
ansible-playbook playbook_bionic.yml --skip-tags "developer" --limit ba-web-bionic64.psonet -k -K

echo "${GREEN}ansible-playbook playbook_buildagent.yml --limit build_agents -K${NC}"
ansible-playbook playbook_buildagent.yml --limit ba-web-bionic64.psonet -k -K

echo "${GREEN}cd back into root${NC}"
cd ..

echo "${YELLOW}Post install message:\nDon't forget to run the TeamCity build-agent ansible script!${NC}"
