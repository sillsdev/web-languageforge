#!/bin/sh

NC='\033[0m' # No Color
RED='\033[0;31m'
GREEN='\033[0;32m'

echo "${GREEN}install Ansible${NC}"
sudo apt install ansible

echo "${GREEN}cd into deploy${NC}"
cd deploy

echo "${GREEN}run Ansible install script:"
echo "ansible-playbook playbook_bionic.yml --limit localhost -K${NC}"
ansible-playbook playbook_bionic.yml --limit localhost -K

echo "${GREEN}cd back into root${NC}"
cd ..
