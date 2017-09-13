#!/bin/bash

if ! [ `whoami` == "root" ]
then
	echo This script must be run with sudo!
	exit
fi

if grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null ; then
    OS=Windows
else
    OS=Linux
fi

echo Add extra apt repositories
wget -O- http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add -
add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial main'
add-apt-repository -y 'deb http://linux.lsdev.sil.org/ubuntu xenial-experimental main'
add-apt-repository -y ppa:ansible/ansible

echo Install NodeJS 8.X and latest npm
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs

echo Install postfix non-interactively
DEBIAN_FRONTEND=noninteractive apt-get install -y postfix

echo Install and upgrade packages
apt install -y git ansible php7.0-cli libapache2-mod-php mongodb-server p7zip-full php7.0-dev php7.0-gd php7.0-intl php7.0-mbstring php-pear php-xdebug postfix unzip lfmerge
apt -y upgrade

if [ ! -d "web-languageforge/deploy" ]
then
	echo Clone web-languageforge repo into the current directory
	git clone --recurse-submodules https://github.com/sillsdev/web-languageforge
fi

cd web-languageforge/deploy

echo "Run xforge web developer ansible scripts"
ansible-playbook -i hosts playbook_create_config.yml --limit localhost
ansible-playbook -i hosts playbook_webdeveloper_bash_windows10.yml --limit localhost

echo "Refresh xForge dependencies"
cd ..
su $SUDO_USER -c "./refreshDeps.sh"

echo Factory Reset the database
cd scripts/tools
php FactoryReset.php run

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

echo You should now be able to access Language Forge locally at http://languageforge.local
echo Installation finished!
