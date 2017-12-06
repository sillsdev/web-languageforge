#!/bin/bash

if [ `whoami` == "root" ]
then
	echo This script cannot be run as sudo!
	exit
fi

if grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    BASHRCFILE="/home/$USER/.bashrc"
    ALREADYHASBASHRCMODS=`grep "rw,noatime,fallback=1" $BASHRCFILE`
    if [ -f "$BASHRCFILE" -a ! -n "$ALREADYHASBASHRCMODS" ]; then
        wget -O- https://raw.githubusercontent.com/sillsdev/web-languageforge/master/installer/bashrcFileAdditionsWSL.txt >> $BASHRCFILE
        echo "Amended $BASHRCFILE with WSL-specific instructions."
    fi
fi
