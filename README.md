# web-languageforge / web-scriptureforge #

[Language Forge](https://github.com/sillsdev/web-languageforge) and [Scripture Forge](https://github.com/sillsdev/web-scriptureforge) represent different websites, but have the same code base stored in seperate repositories for the purpose of  version control and issue tracking. Since they are related repos it is easy to merge from one to the other.


## Recommended Development Environment ##

Our recommended development environment for web development is Linux Ubuntu GNOME.  Choose either the [Vagrant VM Setup](#VagrantSetup) or the [Local Linux Development Setup](#LocalSetup).  Even though the Vagrant VM Setup is definitely easier because it always installs from a clean slate on a new virtual box, we recommend doing development on your local development machine.  This approach will make your page loads approximately 50 times faster.  In my tests 100 ms (local) vs 5000 ms (Vagrant / Virtualbox).  The reason for this is that Virtualbox gives access to the php files via the VirtualBox shared folder feature.  This is notoriously slow.

---------------------------------

### Vagrant VM Setup <a id="VagrantSetup"></a>

Clone this repository to your host machine and and `vagrant up` the Xenial box. We intentionally postpone provisioning on initial boot so the `Virtualbox guest additions` updates don't interfere with the provisioning process.

```
git clone https://github.com/sillsdev/web-languageforge web-languageforge --recurse-submodules
cd deploy/xenial
vagrant up --no-provision
```

Once the shell notifies the Virtualbox guest additions have been updated, power down the Xenial box.

Now, vagrant up with provision to install and deploy

```
vagrant up --provision
```

Proceed to [Language Forge Configuration File](#LFConfig) and follow the rest of the steps in this README.

-------------------------------

### Local Linux Development Setup <a id="LocalSetup"></a>

Start with the Ansible-assisted setup [described here](https://github.com/sillsdev/ops-devbox) to install and configure the LAMP stack (Linux, Apache, MongoDB, and PHP).


#### Installation and Deployment
After creating your Ansible-assisted setup, clone this repository from your *home* folder...

````
mkdir src
cd src
mkdir xForge
cd xForge
git clone https://github.com/sillsdev/web-languageforge web-languageforge --recurse-submodules
````
The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder


If you want to run an independant repo for scriptureforge, clone its repo also...

```
git clone https://github.com/sillsdev/web-scriptureforge web-scriptureforge --recurse-submodules
```

Otherwise just create a symbolic link between languageforge and scriptureforge...

```
ln -s web-languageforge web-scriptureforge
```

Change the variable *mongo_path: /var/lib/mongodb* in `deploy/vars_palaso.yml`
 - **Vagrant VM Setup**: uncomment line 6 and comment line 5
 - **Local Linux Development Setup**: uncomment line 5 and comment line 6 (or whatever is appropriate on your system, its best to have mongo on you HDD rather than SDD). 

Configure ansible.cfg and deploy both sites

````
cd web-languageforge/deploy
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook -i hosts playbook_xenial.yml --limit localhost -K
````

### Language Forge Configuration File <a id="LFConfig"></a>
Manually edit the Language Forge config file

```
sudo gedit /etc/languageforge/conf/sendreceive.conf
```

and modify PhpSourcePath to

```
PhpSourcePath = /var/www/virtual/languageforge.org/htdocs
```

## Installing IDEs and Debugger ##

### Eclipse ###
Install Oracle Java JDK 8

```
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer install oracle-java8-set-default
```

Download [Eclipse](http://www.eclipse.org/downloads/), extract the tar folder and install.

```
tar xvf eclipse-inst-linux64.tar.gz
cd eclipse-installer
./eclipse-inst
```

From the installer, select **Eclipse IDE for PHP Developers**

Create a launcher shortcut from your *home* directory

```
gedit .local/share/applications/eclipse.desktop
```

Replacing your *USERNAME*, paste the content below and save

```
[Desktop Entry]
Name=Eclipse
Type=Application
Exec=/home/USERNAME/eclipse/php-neon/eclipse/eclipse
Terminal=false
Icon=/home/USERNAME/eclipse/php-neon/eclipse/icon.xpm
Comment=Integrated Development Environment
NoDisplay=false
Categories=Development;IDE;
Name[en]=Eclipse
```

Even though we no longer use Eclipse for web development, we [install](https://marketplace.eclipse.org/content/monjadb) the MonjaDB plugin for browsing and updating MongoDB.

Once the MongaDB plugin is installed, access `MongoDB` from the Eclipse menu and select `Connect`.  Click `OK` and you should see the contents of MongoDB.

### PhpStorm ###

Download [PhpStorm](https://www.jetbrains.com/phpstorm/download/#section=linux-version), extract the tar file and install.  You may need to modify newer version numbers accordingly...

```
tar xvf PhpStorm-2016.2.1.tar.gz
sudo mv PhpStorm-162.1889.1/  /opt/phpstorm
sudo ln -s /opt/phpstorm/bin/phpstorm.sh /usr/local/bin/phpstorm
# launch
phpstorm
```

LSDev members can contact their team lead to get the SIL license information.  PhpStorm also has an option *Evaluate for free for 30 days*.

#### Creating the PhpStorm Project ####

Launch PhpStorm.

Click **Create New Project from Existing Files** --> **Next**. 

 From the **Create New Project: Choose Project Directory** dialog,  browse to the `web-languageforge` directory, then mark it as **Project Root** --> **Next**.

From the **Add Local Server** dialog set
Name: `languageforge.local`
Web server root URL: `http://languageforge.local`
--> **Next** --> **Finish**

### Xdebug ###

Ansible will have installed xdebug, but you still need to manually edit the following files:


Edit **/etc/php/7.0/cli/php.ini** to have this line
`zend_extension = /usr/lib/php/20151012/xdebug.so`

Append the following section to the end of **/etc/php/7.0/apache2/php.ini**

```
zend_extension = /usr/lib/php/20151012/xdebug.so

[Xdebug]
xdebug.remote_enable = 1
xdebug.remote_connect_back=1
xdebug.remote_port = 9000
xdebug.scream=0
xdebug.show_local_vars=1
xdebug.idekey=PHPSTORM
```

Reference [Xdebug wizard](https://xdebug.org/wizard.php)

#### Integrating Xdebug with PhpStorm ####

Setting *PHP Interpreter* from PhpStorm

**File** --> **Settings** --> **Languages & Frameworks** --> **PHP**

From the dropdown to *PHP language level*, select `7`
For *Interpreter*, click "..." to browse, then "+"

```
Name: PHP 7
PHP executable: /usr/bin/php
```

Adding *Servers* from PhpStorm

**File** --> **Settings** --> **Languages & Frameworks** --> **PHP** --> **Servers**
Click the "+" to add the following Name & Hosts:
- default.local
- languageforge.local
- scriptureforge.local

Restart apache2

```
sudo service apache2 restart
```

#### Xdebug helper Chrome extension ####

Install the [Xdebug helper](https://chrome.google.com/webstore/detail/xdebug-helper/eadndfjplgieldjbigjakmdgkmoaaaoc) extension which adds a bug icon to the top right area of Chrome extensions.

Right-click to select **Options** and set **IDE key**

```
PhpStorm PHPSTORM
```

When it's time to Debug, check that the bug icon is green for **Debug**.  

Then, from PhpStorm, click the telephone icon near the top right for *Start Listening for PHP Connections*.

Reference for [Integrating Xdebug with PhpStorm](https://www.jetbrains.com/help/phpstorm/2016.2/configuring-xdebug.html#integrationWithProduct).

### LiveReload ###

#### LiveReload Chrome extension

Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en-US) extension.

Then from PhpStorm, click
**View**->**Tool Windows** -> **Gulp**

When you want LiveReload running, double-click the **reload** Gulp task.
Then in the LiveReload chrome extension, left click to enable it.  A solid dot in the circle means the plugin is connected. Now when an applicable source file is changed and saved, it should trigger an automate page reload in the browser.

## Testing ##

### PHP Unit Tests ###

Unit testing currently uses [SimpleTest](http://www.simpletest.org/).

To run tests, browse to [default.local/web-languageforge/test/php](http://default.local/web-languageforge/test/php/) and click [AllTest.php](http://default.local/web-languageforge/test/php/AllTests.php). If you want to run just a few tests, browse to sub-folders and click on AllTests.php within to narrow tests.

Note: at least one test will fail if the LFMerge (send/receive) program is not installed and available.  This is OK as long as you are not testing Send/Receive functionality.

### End-to-End (E2E) Tests ###

#### Install/Update Webdriver ####

From the `web-languageforge` directory

```
npm install
gulp test-e2e-webdriver_update
```

#### E2E Test Run ####

From the *web-languageforge* directory, start **webdriver** in one terminal:

````
gulp test-e2e-webdriver_standalone
````

Then to run **languageforge** tests in another terminal:

````
./rune2e.sh lf
````

To run **scriptureforge** tests:

```
./rune2e.sh sf
```

To test a certain test spec, add a parameter `--specs [spec name]`.  For example, 
```
./rune2e.sh lf --specs lexicon-new-project
``` 
will run the  the *lexicon-new-project.spec.js* tests on **languageforge**.

To add more verbosity during E2E tests, add a parameter `--verbosity true`

## Building with gulp ##

(For installation of npm see https://github.com/nodesource/distributions)

Install gulp dependencies by running from the repo root (where):

    npm install

To install the mongodb databases locally, run:

```
gulp mongodb-copy-prod-db
```

## Resetting the MongoDB ##

If you want to _start over_ with your mongo database, you can use the factory reset script like so (this will delete all data in the mongodb):
````
cd scripts/tools
./factoryReset.php run
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


