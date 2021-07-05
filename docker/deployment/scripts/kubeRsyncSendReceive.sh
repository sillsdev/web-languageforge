#!/bin/bash

ssh -A -p 55555 -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" root@localhost "rsync -avzhP chirt@sysops.languageforge.org:/var/lib/languageforge/lexicon /var/lib/languageforge/lexicon"
