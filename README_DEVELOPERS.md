# Developer Information #

## Recommended Development Environment ##

Our recommended development environment for web development is Linux Mint.  The easiest way to get setup is to use the Ansible assisted setup [described here](https://github.com/sillsdev/ops-devbox).

Among other things this setup will ensure that you have:

* A working *nodejs*, and *npm*.
* A globally installed *gulp* and *bower*.
* A globally installed *composer*.

## Development Environment ##

Your development environment can be setup using Ansible.  Ansible Playbooks are provided that will install and configure the LAMP stack; installing and configuring Apache, PHP, and MongoDB.

* The apache virtual host is created.
* A MongoDB document store created with appropriate user and permissions granted.
* The */etc/hosts* file is updated to point languageforge.local and scriptureforge.local to localhost.

### LAMP Stack Setup ###
Choose either the **Vagrant VM Setup** or the **Local Linux Development Setup**.  The Vagrant Setup is definitely easier as it always installs from a clean slate on a new virtual box.

We recommend doing development on your development machine directly rather than using Vagrant.  This approach will make your page loads approximately 50 times faster.  In my tests 100 ms (local) vs 5000 ms (Vagrant / Virtualbox).  The reason for this is that Virtualbox gives access to the php files via the VirtualBox shared folder feature.  This is notoriously slow.

#### Ansible Setup ####

For either **Vagrant VM Setup** or **Local Linux Development Setup**, merge the contents of `deploy/ansible.cfg` into `/etc/ansible/ansible.cfg`.

#### Vagrant VM Setup ####

Change the variable *mongo_path: /var/lib/mongodb* in `deploy/vars_palaso.yml`, i.e. uncomment line 6 and comment line 5. 

````
cd deploy/debian
vagrant up --provision
````

You will need to manually edit your `/etc/hosts` file such that *default.local*, *languageforge.local*, *scriptureforge.local*, *jamaicanpsalms.scriptureforge.local* and *demo.scriptureforge.local* map to *192.168.33.10*.

````
192.168.33.10	default.local
192.168.33.10	languageforge.local
192.168.33.10	scriptureforge.local
192.168.33.10	jamaicanpsalms.scriptureforge.local
192.168.33.10	demo.scriptureforge.local
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
ansible-playbook -i hosts playbook_palaso.yml --limit localhost -K
````

## Testing ##

### PHP Unit Tests ###

Unit testing currently uses [SimpleTest](http://www.simpletest.org/). Browse to [default.local/web-language/test/php](http://default.local/web-language/test/php/) and click [AllTest.php](http://default.local/web-language/test/php/AllTests.php). Browse to sub-folders to narrow tests.

### End-to-End (E2E) Tests ###

#### E2E Test Install ####

Install **webdriver-manager** globally, then install **webdriver**:

````
sudo npm install -g webdriver-manager
sudo webdriver-manager update --standalone
````

#### E2E Test Run ####

First start **webdriver** in one terminal:

````
webdriver-manager start
````

Then run tests in another terminal:

````
cd test/app
sh rune2eLF.sh
````
to test in on the **languageforge** site or run `sh rune2eSF.sh` to test on the **scriptureforge** site. Browse to sub-folders to narrow tests.

## Building with gulp ##

(For installation of npm see https://github.com/nodesource/distributions)

Install gulp and dependencies by running

    npm install gulp gulp-util async gulp-livereload tiny-lr

Afterwards you can build by running (from the root directory of the source tree):

    gulp

To install the mongodb databases locally, run:

	gulp copy-prod-db
