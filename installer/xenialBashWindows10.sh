#!/bin/bash

if ! [ `whoami` == "root" ]
then
	echo This script must be run with sudo!
	exit
fi

echo -e "
Notice: This installer assumes the following:

- it is being run in Bash a fresh Ubuntu Xenial on Windows 10 installation.
- it is being run from a source directory (e.g. /mnt/c/src ) where the web-languageforge repo will be cloned.

  If this is not the case, continue at your own risk

In the off chance that you want to completely remove and reinstall Xenial Bash on Windows 10,
you can run these commands from a Windows Command Prompt (not Bash!) before running this script:

lxrun /uninstall /full 
lxrun /install 
"

read -n 1 -s -r -p "Press any key to start the xForge developer environment install process"
echo -e "\n\n"

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

HOSTSFILE=/mnt/c/Windows/System32/drivers/etc/hosts
if [ -f "$HOSTSFILE" ]
then
	echo "Modify windows hosts file"
	echo -e "\n127.0.0.1\tlanguageforge.local\n" >> $HOSTSFILE
	echo -e "\n127.0.0.1\tscriptureforge.local\n" >> $HOSTSFILE
	echo -e "\n127.0.0.1\tjamaicanpsalms.scriptureforge.local\n" >> $HOSTSFILE
fi

echo You should now be able to access Language Forge locally at http://languageforge.local
echo Installation finished!
