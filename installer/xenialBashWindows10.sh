#!/bin/bash

if [ `whoami` == "root" ]
then
	echo This script cannot be run as sudo!
	exit
fi

if grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    OS=Windows
else
    OS=Linux
fi

if [ $OS == "Windows" ]; then
    echo "I see that you are running this script in Windows 10 WSL.  Before proceeding, you must install the Java JRE and NodeJS in Windows to be able to run E2E tests."
    echo "Have you done that in a Windows command prompt already? (Ctrl-C to exit and do that now, if necessary)"
    read -p "Otherwise, press any key to continue"
fi

echo "Please enter your sudo password below (necessary for some installation steps)"
sudo "echo Thank you!"

echo Add extra apt repositories
wget -O- http://linux.lsdev.sil.org/downloads/sil-testing.gpg | sudo apt-key add -
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial main'
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial-experimental main'
sudo add-apt-repository -y ppa:ansible/ansible

echo Install NodeJS 8.X and latest npm
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install -y nodejs

echo Install postfix non-interactively
DEBIAN_FRONTEND=noninteractive sudo apt install -y postfix

echo Install and upgrade packages
sudo apt install -y git ansible php7.0-cli libapache2-mod-php mongodb-server p7zip-full php7.0-dev php7.0-gd php7.0-intl php7.0-mbstring php-pear php-xdebug postfix unzip lfmerge
sudo apt -y upgrade

if [ ! -d "web-languageforge/deploy" ]
then
	echo Clone web-languageforge repo into the current directory
	git clone --recurse-submodules https://github.com/sillsdev/web-languageforge
fi

cd web-languageforge/deploy

echo "Run xforge web developer ansible scripts"
echo "Please enter your sudo password when prompted (twice)"
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook -i hosts playbook_webdeveloper_bash_windows10.yml --limit localhost -K

echo "Refresh xForge dependencies"
cd ..
./refreshDeps.sh

echo "Please enter your sudo password if necessary"
sudo echo "Thank you!"

echo "Factory Reset the database"
cd scripts/tools

sudo php FactoryReset.php run

if [ $OS == "Windows" ]; then
    HOSTSFILE=/mnt/c/Windows/System32/drivers/etc/hosts
    ALREADYHASHOSTS=`grep "languageforge.local" $HOSTSFILE`
    if [ -f "$HOSTSFILE" -a ! -n "$ALREADYHASHOSTS" ]; then
        echo "Modify Windows hosts file"
        HOSTLINES="
        127.0.0.1\tlanguageforge.local
        127.0.0.1\tscriptureforge.local
        127.0.0.1\tjamaicanpsalms.scriptureforge.local"
        echo -e "$HOSTLINES" >> $HOSTSFILE
    fi

    BASHRCFILE="/home/$SUDO_USER/.bashrc"
    ALREADYHASSERVICESTART=`grep "service apache2 start" $BASHRCFILE`
    if [ -f "$BASHRCFILE" -a ! -n "$ALREADYHASSERVICESTART" ]; then
        echo "Adding service start lines to $BASHRCFILE"
        SERVICELINES="
        echo 'Starting Language Forge services (from .bashrc)'
        sudo service apache2 start
        sudo service postfix start
        sudo service mongodb start"
        echo "$SERVICELINES" >> $BASHRCFILE
    fi

    echo "Note: the Windows Bash window must be open in order for languageforge.local to work"
fi

echo "Run PHP Unit tests"
cd ../..
gulp test-php

echo "Now we're ready to run E2E tests"
echo "Selenium Server must be running before proceeding."
if [ $OS == "Windows" ]; then
    echo "Selenium server can be started from a Windows command prompt by typing 'selenium-standalone start'"
else
    echo "Selenium server can be started in a separate process by typing 'gulp test-e2e-webdriver_standalone' in a separate terminal process"
fi
read -p "Press any key once Selenium Server is up and running"

echo "Now Running E2E tests in Chrome"
./rune2e.sh lf

echo "You should now be able to access Language Forge locally at http://languageforge.local"

echo "Installation finished!"

echo "Did the PHP and end-to-end tests pass?"
