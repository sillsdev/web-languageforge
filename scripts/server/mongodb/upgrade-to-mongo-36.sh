#!/bin/bash

echo ""
echo "Upgrade process:"
echo "- Ensure Mongo PPA is available"
echo "- Do a mongodump to a location with enough room"
echo "- Download Mongo 3.6 packages but do not install (yet)"
echo "- Shut down Mongo server"
echo "- Install new Mongo 3.6 packages"
echo "- Do a mongorestore"
echo ""

# Sanity checks
which systemctl >/dev/null
if [ $? -ne 0 ]; then
    echo "Looks like systemd isn't installed on this computer; this script will fail."
    echo "You might still be able to do the upgrade by hand."
    exit 2
fi

spaceavail=$(df -k /var/lib --output=avail | sed 1d)
echo "Looks like you have $spaceavail KiB available for MongoDB data"

yesno() {
  # NOTE: Defaults to NO
  read -p "$1 [y/N] " ynresult
  case "$ynresult" in
    [yY]*) true ;;
    *) false ;;
  esac
}

if [ $spaceavail -lt 1048576 ]; then
    echo "You have less than 1 GiB available in /var/lib; please free up some room (maybe run 'sudo apt clean') and try again."
    echo "Or if you REALLY want to proceed, then comment this section out of the script (could be dangerous!) and re-run it."
    exit 2
fi

if [ $spaceavail -lt 4194304 ]; then
    echo "You have less than 4 GiB available in /var/lib; please free up some room (maybe run 'sudo apt clean') and try again."
    echo "The script will *probably* succeed, but if you run out of room during the mongorestore process, your Mongo database"
    echo "might fail to come up in a working state. If you're at all unsure, then stop here and free up some room first."
    if yesno "Proceed despite low disk space?"; then
        echo "Okay, proceeding despite low disk space..."
    else
        exit 1
    fi
fi

spaceavail=$(df -k ${HOME} --output=avail | sed 1d)
echo "Looks like you have $spaceavail KiB available in your home directory (where the mongodump backup will be stored)"

if [ $spaceavail -lt 1048576 ]; then
    echo "You have less than 1 GiB available in your home directory; the mongodump command is likely to fail."
    echo "Please free up some room in ${HOME} and try again."
    echo "Or if you REALLY want to proceed, then comment this section out of the script and re-run it."
    exit 2
fi

if [ $spaceavail -lt 4194304 ]; then
    echo "You have less than 4 GiB available in your home directory; the mongodump command might fail (but it will probably succeed)."
    echo "Please free up some room in ${HOME} and try again."
    if yesno "Proceed despite low disk space in home directory?"; then
        echo "Okay, proceeding despite low disk space in home directory..."
    else
        exit 1
    fi
fi

echo
echo "Script does not need to be run as root; it uses sudo when root permissions are needed."
echo "If you get prompted for your sudo password, please enter it now:"
sudo id >/dev/null

echo
echo "*** Ensuring Mongo PPA is available ***"
echo

# Mongo 3.6 release signing key: 58712A2291FA4AD5
gpg --keyserver keys.gnupg.net --recv-keys 58712A2291FA4AD5
gpg --export 58712A2291FA4AD5 | sudo apt-key add -


echo
echo "*** Dumping Mongo data from old installation ***"
echo

mkdir -p ${HOME}/tmp/mongobackup
mongodump -o ${HOME}/tmp/mongobackup
RETCODE=$?
if [ $RETCODE -ne 0 ]; then
    echo "Mongodump failed; not proceeding with destructive operations"
    exit $RETCODE
fi

echo
echo "*** Downloading Mongo 3.6 packages but not installing (yet) ***"
echo

echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt update
sudo apt install mongodb-org -dy

echo
echo "*** Shutting down old Mongo server ***"
echo

sudo systemctl stop mongodb
sudo systemctl mask mongodb
sudo systemctl daemon-reload
# "mask" means "do not allow this service to be started, ever".
# This is because the mongodb-org packages install a service called "mongod",
# and we don't want "mongod" and "mongodb" to try to run at the same time.

# Move the mongodb 2.6 data out of the way instead of deleting it (for safety)
sudo mv /var/lib/mongodb /var/lib/mongodb-mmapi

echo
echo "*** Installing new Mongo server ***"
echo

sudo apt install mongodb-org -y

echo "Running systemctl daemon-reload"
sudo systemctl daemon-reload


echo
echo "*** Running mongorestore into newly-installed server ***"
echo

isRunning() {
    serviceName=$1
    if [ -z "$serviceName" ]; then
        return 1
    fi
    activestate=$(systemctl show -p ActiveState "$serviceName")
    substate=$(systemctl show -p SubState "$serviceName")
    if [ "$activestate" = "ActiveState=active" -a "$substate" = "SubState=running" ]; then
        # In Bash scripting, 0 means true and non-zero means false
        return 0
    else
        return 1
    fi
}

sudo service mongod start

while ! isRunning mongod
do
    echo "Waiting for mongod service to start running..."
    sleep 1
done

mongorestore ${HOME}/tmp/mongobackup


echo ""
echo "*** SUCCESS! ***"
echo ""
echo "Now verify that all the data is still there."
echo "Once you're confident, you can safely delete /var/lib/mongodb-mmapi and ${HOME}/tmp/mongobackup"
echo ""
