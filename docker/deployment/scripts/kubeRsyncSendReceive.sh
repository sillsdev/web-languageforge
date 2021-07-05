#!/bin/bash

# Documentation:
# -A  agent forwarding
# -p 55555 this port is being forwarded to 22 on the container
# -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" these are a hack to bypass security checks for "localhost".  localhost isn't a real host so I don't care about "host key verification failed" errors when doing localhost port forwarding

ssh -A -p 55555 -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" root@localhost "rsync -avzhP chirt@sysops.languageforge.org:/var/lib/languageforge/lexicon/ /var/lib/languageforge/lexicon/"
