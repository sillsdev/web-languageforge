# web-languageforge / web-scriptureforge #

Although [web-languageforge](https://github.com/sillsdev/web-languageforge) and [web-scriptureforge](https://github.com/sillsdev/web-scriptureforge) represent different websites, they have the same code base but are stored in seperate repositories for the purpose of  version control and issue tracking. Since they are related repos it is easy to merge from one to the other.


## Recommended Development Environment ##

### Prerequisite - LAMP Stack Setup ###
Our recommended development environment for web development is Linux Ubuntu Gnome.  Choose either the **Vagrant VM Setup** or the **Local Linux Development Setup**.  The Vagrant Setup is definitely easier as it always installs from a clean slate on a new virtual box.

We recommend doing development on your development machine directly rather than using Vagrant.  This approach will make your page loads approximately 50 times faster.  In my tests 100 ms (local) vs 5000 ms (Vagrant / Virtualbox).  The reason for this is that Virtualbox gives access to the php files via the VirtualBox shared folder feature.  This is notoriously slow.


Start with the Ansible-assisted setup [described here](https://github.com/sillsdev/ops-devbox) to install and configure the LAMP stack (Linux, Apache, MongoDB, and PHP).


### Installation
After creating your Ansible-assisted setup, clone this repository from your *home* folder...

````
mkdir src
cd src
mkdir xForge
cd xForge
git clone https://github.com/sillsdev/web-languageforge web-languageforge --recurse-submodules
````

> The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder.

If you want to run an independant repo for scriptureforge, clone its repo also...

```
git clone https://github.com/sillsdev/web-scriptureforge web-scriptureforge --recurse-submodules
```

Otherwise just create a symbolic link between languageforge and scriptureforge...

```
ln -s web-languageforge web-scriptureforge
```

Now deploy both sites...

````
cd web-languageforge/deploy
ansible-playbook -i hosts playbook_mint.yml --limit localhost -K
````

---------------------------------------------------
# README DEVELOPER Information



For either **Vagrant VM Setup** or **Local Linux Development Setup**, merge the contents of `deploy/default_ansible.cfg` into `/etc/ansible/ansible.cfg` or `.ansible.cfg` (in your home folder).

TODO: this is unclear.  We should make a bash script that merges this for you.  Also, /etc/ansible/ansible.cfg does not appear to be present when installed via pip

#### Vagrant VM Setup ####

Change the variable *mongo_path: /var/lib/mongodb* in `deploy/vars_palaso.yml`, i.e. uncomment line 6 and comment line 5. 

````
cd deploy/debian
vagrant up --provision
````


The Vagrant configuration uses Ansible to provision the box.

Install the php packages, this can take awhile. Note that you must have [composer](https://getcomposer.org/) and [bower](http://bower.io/) installed to do this.

```
cd ../../src
composer install
bower install
```


#### Local Linux Development Setup ####

The Ansible configuration used for the Vagrant setup can also be used to setup your local linux development machine.

Change the variable *mongo_path: /hddlinux/mongodb* in `deploy/vars_palaso.yml`, i.e. uncomment line 5 and comment line 6 (or whatever is appropriate on your system, its best to have mongo on you HDD rather than SDD). 

````
cd deploy
ansible-playbook -i hosts playbook_mint.yml --limit localhost -K
````

You also need to make sure that the src and test folders has permissions such that www-data can write to it.  e.g.
````
chgrp -R www-data src
chgrp -R www-data test
````

## Testing ##

### PHP Unit Tests ###

Unit testing currently uses [SimpleTest](http://www.simpletest.org/).

To run tests, browse to [default.local/web-languageforge/test/php](http://default.local/web-languageforge/test/php/) and click [AllTest.php](http://default.local/web-languageforge/test/php/AllTests.php). If you want to run just a few tests, browse to sub-folders and click on AllTests.php within to narrow tests.

Note: at least one test will fail if the LFMerge (send/receive) program is not installed and available.  This is OK as long as you are not testing Send/Receive functionality.

### End-to-End (E2E) Tests ###

#### E2E Test Install ####

Make sure npm is up-to-date
````
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
````

Make sure java is installed
````
sudo apt-get install openjdk-7-jre-headless
````

Update **webdriver**.  (Old way prior to Angular 1.5 installed **webdriver-manager** ~~globally~~ since our local repo was on an NTFS partition and items there are not executable, then install **webdriver**):

````
cd test/app
./webdriver.sh update
````

#### E2E Test Run ####

First start **webdriver** in one terminal:

````
cd test/app
./webdriver.sh start
````

Then run tests in another terminal:

````
cd test/app
sh rune2eLF.sh
````
to test in on the **languageforge** site or run `sh rune2eSF.sh` to test on the **scriptureforge** site. Add a test name argument to the previous or browse to sub-folders to narrow tests.

## Building with gulp ##

(For installation of npm see https://github.com/nodesource/distributions)

Install **gulp** globally (it needs to be installed globally since our local repo is on an NTFS partition and items there are not executable):

	sudo npm install -g gulp

Install gulp dependencies by running from the repo root (where):

    npm install

To install the mongodb databases locally, run:

	gulp copy-prod-db

## Resetting the MongoDB ##

If you want to _start over_ with your mongo database, you can use the factory reset script like so (this will delete all data in the mongodb):
````
scripts/tools/factoryReset.php run
````
After a fresh factory reset, there is one user.  username: admin password: password

## Updating dependencies ##

Occasionally developers need to update composer, bower or npm.  If something isn't working after a recent code change, try to update the dependencies:

#### Update bower ####

In src/: `bower install`

#### Update npm packages ####

In the root folder: `npm install`

#### Update composer ####

In src/: `composer install`


