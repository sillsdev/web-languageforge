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
    echo "I see that you are running this script in Windows 10 WSL."

    echo "hi" > /mnt/c/Windows/amiadmin
    if [ $? == 1 ]; then
        echo "This script must be run inside an elevated Bash terminal!"
        echo "Re-open this Ubuntu Bash terminal by right-clicking on the icon and 'Run as Administrator'"
        exit
    else
        rm /mnt/c/Windows/amiadmin
    fi
    echo "We will use the Windows package manager Chocolatey to install Windows dependencies (JRE and Selenium Server)"
    read -p "press [Enter] when you're ready"
    powershell.exe -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
    cmd.exe /C "choco install -y jre8 selenium selenium-chrome-driver"

    echo "Starting Selenium Server standalone in a separate process..."
    cmd.exe /C "C:\tools\selenium\standalone.cmd" &
fi

echo "Please enter your sudo password below (necessary for some installation steps)"
sudo echo "Thank you!"

echo Add extra apt repositories
wget -O- http://linux.lsdev.sil.org/downloads/sil-testing.gpg | sudo apt-key add -
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial main'
sudo add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial-experimental main'
sudo add-apt-repository -y ppa:ansible/ansible

echo Install NodeJS 8.X and latest npm
wget -O- https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt install -y nodejs

echo Install postfix non-interactively
sudo DEBIAN_FRONTEND=noninteractive apt install -y postfix

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
if [ $OS == "Linux" ]; then
    echo "Selenium server can be started in a separate process by typing 'gulp test-e2e-webdriver_standalone' in a separate terminal process"
    read -p "Press [Enter] once Selenium Server is up and running"
fi

echo "Now Running E2E tests in Chrome"
./rune2e.sh lf

echo "You should now be able to access Language Forge locally at http://languageforge.local"
echo "username: admin"
echo "password: password"
echo "Installation finished!"
echo "Did the PHP and end-to-end tests pass?"
