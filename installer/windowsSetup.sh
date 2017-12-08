#!/bin/bash
set -e

if [ `whoami` == "root" ]
then
	echo This script cannot be run as sudo!
	exit
fi
grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null && OS=Windows
if [ "$OS" == "Windows" ]; then
    BASHRCFILE="/home/$USER/.bashrc"
    ALREADYHASBASHRCMODS=`grep "rw,noatime,fallback=1" $BASHRCFILE`
    if [ -f "$BASHRCFILE" -a ! -n "$ALREADYHASBASHRCMODS" ]; then
        wget -O- https://raw.githubusercontent.com/sillsdev/web-languageforge/master/installer/bashrcFileAdditionsWSL.txt >> $BASHRCFILE
        echo "Amended $BASHRCFILE with WSL-specific instructions."
    fi
    RETURNCODE=0
    echo "hi" > /mnt/c/Windows/amiadmin || RETURNCODE=$?
    if [ "$RETURNCODE" -ne 0 ]; then
        echo "This script must be run inside an elevated Ubuntu terminal!"
        echo "Re-open this Ubuntu terminal by right-clicking on the icon and 'Run as Administrator'"
        exit
    else
        rm /mnt/c/Windows/amiadmin
    fi

    echo "We will use the Windows package manager Chocolatey to install Windows dependencies (JRE and Selenium Server)"
    read -p "press [Enter] when you're ready"
    powershell.exe -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
else
    echo "Error: This script is intended to be run with Windows 10 WSL"
fi
