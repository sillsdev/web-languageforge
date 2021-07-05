#!/bin/bash

ssh -A -p 55555 -o "UserKnownHostsFile=/dev/null" -o "StrictHostKeyChecking=no" root@localhost "rsync -avzhP chirt@sysops.languageforge.org:/var/www/languageforge.org/htdocs/assets/lexicon /var/www/html/assets/lexicon"
