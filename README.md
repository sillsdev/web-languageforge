# web-languageforge / web-scriptureforge #

[Language Forge](https://languageforge.org) and [Scripture Forge](https://scriptureforge.org) represent different websites, but have the same code base stored in one [repository](https://github.com/sillsdev/web-languageforge).

## Users ##

To use **Language Forge** go to [languageforge.org](https://languageforge.org).

To use **Scripture Forge** go to [scriptureforge.org](https://scriptureforge.org).

### User Problems ###

To report an user issue with the **Language Forge** application, email "issues @ languageforge dot org".

To report an user issue with the **Scripture Forge** application, email "issues @ scriptureforge dot org".

## Special Thanks To ##

For end-to-end test automation:

![BrowserStack Logo](readme_images/browserstack-logo.png "BrowserStack")

For error reporting:

[![Bugsnag logo](readme_images/bugsnag-logo.png "Bugsnag")](https://bugsnag.com/blog/bugsnag-loves-open-source)

## Developers ##

We use [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) with two modifications:

- The Gitflow **master** branch is our **live** branch.
- The Gitflow **develop** branch is our **master** branch. All pull requests go against **master**.

We merge from **master** to testing (**qa** branch) then ship from **qa** to **live**.

| Site            | Master Branch | QA Branch | Live Branch |
| --------------- | ------------- | --------- | ----------- |
| Language Forge  | `master` | `lf-qa` | `lf-live` |
| Scripture Forge | `master` | `sf-qa` | `sf-live` |

### Builds ###

Status of builds from our continuous integration (CI) [server](https://build.palaso.org):

| Site            | Master Unit | Master E2E | QA | Live |
| --------------- | ----------- | ---------- | -- | ---- |
| Language Forge  | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt372)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeLive)/statusIcon) |
| Scripture Forge | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt270)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeLive)/statusIcon) |

Successful builds from our CI server deploy to:

| Site            | Master | QA | Live |
| --------------- | ------ | -- | ---- |
| Language Forge  | [dev.languageforge.org](https://dev.languageforge.org) | [qa.languageforge.org](https://qa.languageforge.org) | [languageforge.org](https://languageforge.org) |
| Scripture Forge | [dev.scriptureforge.org](https://dev.scriptureforge.org) | [qa.scriptureforge.org](https://qa.scriptureforge.org) | [scriptureforge.org](https://scriptureforge.org) |

## Style Guides ##

PHP code conforms to [PSR-2](http://www.php-fig.org/psr/psr-2/).

- Add `php-cs-fixer` globally installed with *composer* (http://cs.sensiolabs.org/). Here is how to add it to **PhpStorm** (https://hackernoon.com/how-to-configure-phpstorm-to-use-php-cs-fixer-1844991e521f). Use it with the parameters `fix --verbose "$FileDir$/$FileName$"`.

JavaScript code conforms to [AirBNB JS style guide](https://github.com/airbnb/javascript).

- Using PhpStorm with JSCS helps a lot with automating this (see the section below on PhpStorm [Coding Standard and Style](#coding-standard-and-style)).
- We plan to use [Prettier](https://prettier.io/) with pre-commit hook after re-writing the whole repo with Prettier first.

### TypeScript Style Guide ###

Our code base has moved from JavaScript to [**TypeScript**](https://www.typescriptlang.org).

> Note: this repo is currently AngularJS (1.6) not Angular (2+).

Our TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure. This is an appropriate time to change structure and file names since most file contents will be changed anyway. The reason for following this is to make it easier, not only for new developers to the project (like the FLEx team and hired developers) but also to change to Angular (2+) later.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We are expecting that TypeScript will help us get things right from the beginning (catching things even as you type) as well as maintenance. We are expecting that it will be an easier transition for the FLEx team and that they will be able to help us with good typing, interfaces and class design.

Other useful resources:

- [x] [angularjs-styleguide/typescript at master · toddmotto/angularjs-styleguide](https://github.com/toddmotto/angularjs-styleguide/tree/master/typescript#stateless-components)
- [x] [AngularJS 1.x with TypeScript (or ES6) Best Practices by Martin McWhorter on CodePen](https://codepen.io/martinmcwhorter/post/angularjs-1-x-with-typescript-or-es6-best-practices)
- [x] [What is best practice to create an AngularJS 1.5 component in Typescript? - Stack Overflow](https://stackoverflow.com/questions/35451652/what-is-best-practice-to-create-an-angularjs-1-5-component-in-typescript)
- [x] [Don't Panic: Using ui-router as a Component Router](http://dontpanic.42.nl/2016/07/using-ui-router-as-component-router.html)
- [x] [Lifecycle hooks in Angular 1.5](https://toddmotto.com/angular-1-5-lifecycle-hooks#onchanges)

## Recommended Development Environment ##

### Automatic Install ###

The below sections go into detail on how to manually set up the developer environment.  As an alternative to these instructions, you can download and run the automatic install script that is known to work on Ubuntu Xenial Native and Ubuntu Xenial on Windows 10 WSL.
[Click here for the Automatic Install instructions](#automatic-install-script).

### Linux Ubuntu Gnome ###

Our recommended development environment for web development is Linux Ubuntu GNOME.
There are three main installation methods:
- [Local Linux Development Setup](#local-linux-development-setup). Everything is installed directly on your machine, which needs to be running Ubuntu 16.04. This is the best method because everything runs at full speed.
- [Vagrant GUI Setup](#vagrant-gui-setup). This is the simplest setup method. A Vagrant box with xForge already installed is downloaded and set up on your machine. The main drawback is speed. In some tests the e2e tests took approximately 10 minutes, rather than the 5 minutes they normally take.
- [Vagrant headless setup](#vagrant-headless-setup). A small base box is downloaded and xForge is then installed into it. The source code is kept in a shared folder between the host and guest operating systems. This has a number of drawbacks, one of which is that page loads are much slower (50 times slower in some tests; 5000 ms rather than 100 ms). The reason for this is that Virtualbox gives access to the repo files on NTFS via the VirtualBox shared folder feature.  This is notoriously slow.

### Ubuntu Xenial on Windows 10 WSL ###

It is also possible to develop on Windows 10 using the Windows Subsystem for Linux (WSL). This allows you to run a Linux distribution, such as Ubuntu, in Windows. The development environment has only been tested on Windows 10 Creators Update (1703). For the full steps on setting up a development environment in Windows 10, see [Windows 10 Setup](#windows-10-setup).

## Automatic Install Script ##

This automatic install script assumes that you are starting with a fresh install of Ubuntu Xenial, either native or on Windows 10 WSL.

To begin the automatic installation, cd into a source directory (creating one if necessary).  On Windows 10 WSL this might look like this (make sure you are in Bash!):

``` bash
mkdir -p /mnt/c/src
cd /mnt/c/src
```

Now, download and run the install script:

``` bash
wget -O- https://raw.githubusercontent.com/sillsdev/web-languageforge/master/installer/ubuntu1604Installer.sh | bash -
```

Expect the install to take 30-60 minutes on a fresh Ubuntu Xenial install, depending upon your internet connection.

### How to Setup/Uninstall/Reinstall Ubuntu on Windows 10 WSL ###

If you have never installed Ubuntu on Windows 10, [follow the instructions in this guide](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide) to ensure the pre-requisites are installed

If you have already installed Ubuntu on Windows 10 but want to uninstall and re-install fresh open a Windows Command Prompt (Run as Administrator) and type the following:

``` bash
lxrun /uninstall /full
```

If this is your first time installing Ubuntu Xenial on Windows 10 (or if you just uninstalled in the previous step) type the following:

``` bash
lxrun /install
```

After Ubuntu Xenial Bash has finished installing, close the Windows Command Prompt and open a Bash prompt (now available in the start menu)

-------------------------------

### Vagrant GUI Setup ###

Install [VirtualBox](https://www.virtualbox.org/) and [Vagrant](https://www.vagrantup.com/) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and setup **git** for you (at least *name* and *email* is needed in `.gitconfig`). Make sure virtualization is enabled in your BIOS.

Create a directory for the installation, such as `src/xForge`. Download the file [deploy/vagrant_xenial_gui/Vagrantfile](https://raw.githubusercontent.com/sillsdev/web-languageforge/master/deploy/vagrant_xenial_gui/Vagrantfile) to the directory where you want to install. Then open the command line to that directory and run `vagrant up`. This will download a box (it's about 5GB, so expect it to take a while) and run a few setup steps. When it is complete the virtual machine should be open. Launch the web browser and try navigating to languageforge.local or scriptureforge.local. The default login credentials are "admin" and "password".

### Vagrant Headless Setup ###

If you are on Windows, begin by giving your user account permission to create symlinks. This is necessary or `npm install` will not run properly.

- Run `secpol.msc`. This ([reportedly](https://www.virtualbox.org/ticket/10085#comment:32)) does not exist on some versions of Windows and you will have to use [a workaround](https://stackoverflow.com/questions/815472/how-do-i-grant-secreatesymboliclink-on-windows-vista-home-edition).
- Go to Local Policies -> User Rights Assignment -> Create symbolic links -> Add User or Group...
- Type your username in the text field and click "Check Names".
- Click OK, then click OK, and close the Local Security Policy window.
- You might have to log out of your user account and log back in for the change to take effect.

See [the screenshot.](readme_images/windows_allow_symlinks.png)

- Download the file https://github.com/sillsdev/web-languageforge/blob/master/deploy/xenial/Vagrantfile and save it as Vagrantfile.
- Open the command line to the directory where the Vagrantfile is and run `vagrant up --no-provision` (this delays provisioning so the VirtualBox guest additions updates don't interfere with the provisioning process.)
- Run `vagrant up --provision`

``` bash
wget https://raw.githubusercontent.com/sillsdev/web-languageforge/master/deploy/xenial/Vagrantfile
vagrant up --no-provision
vagrant up --provision
```

Edit your hosts file (On Linux, `/etc/hosts`, on Windows, `C:\windows\system32\drivers\etc\hosts`. You will have to use sudo on Linux and edit as Administrator on Windows). Add the following lines:
```
192.168.33.10     languageforge.local
192.168.33.10     scriptureforge.local
192.168.33.10     jamaicanpsalms.scriptureforge.local
```
Then open languageforge.local and scriptureforge.local ensure they load correctly.

Proceed to [Language Forge Configuration File](#language-forge-configuration-file) and follow the rest of the steps in this README.

-------------------------------

### Local Linux Development Setup ###

Start by installing Git and Ansible:
``` shell
sudo add-apt-repository ppa:ansible/ansible
sudo apt-get update
sudo apt-get install -y git ansible
```

Now create a directory for installation and clone the repo:
``` shell
mkdir -p src/xForge
cd src/xForge
git clone https://github.com/sillsdev/web-languageforge --recurse-submodules
```

The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder. If you've already cloned the repo without `--recurse-submodules`, run `git submodule update --init --recursive` to pull and initialize them.

If you want to run an independent repo for Scripture Forge, clone its repo also:
``` bash
git clone https://github.com/sillsdev/web-scriptureforge --recurse-submodules
```

Otherwise just create a symbolic link between languageforge and scriptureforge:
``` bash
ln -s web-languageforge web-scriptureforge
```

Change the variable `mongo_path: /var/lib/mongodb` in `deploy/vars_palaso.yml`. Set it to a location where MongoDB should store its databases.

- **Vagrant VM Setup**: uncomment line 6 and comment line 5
- **Local Linux Development Setup**: uncomment line 5 and comment line 6 (or whatever is appropriate on your system, its best to have Mongo store databases on your HDD rather than SSD). Make sure the `mongodb` user has permission to read and write to the path you specify.

Run the following Ansible playbooks to configure Ansible and run both sites.

```` bash
cd web-languageforge/deploy
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook playbook_xenial.yml --limit localhost -K
````

#### Testing the Installation

To build the JavaScript and CSS, run `refreshDeps.sh lf` if you are working on Language Forge, or `refreshDeps.sh sf` if you are working on Scripture Forge. Running `refreshDeps.sh` without arguments defaults to Language Forge.

That's it; you should now be able to open your browser to languageforge.local and scriptureforge.local and log in with the credentials "admin" and "password".

Now would be a good time to check that PHP unit tests, TS unit tests, and E2E tests all work. See the [Testing](#Testing) section below.

#### Building TypeScript and Sass

`refreshDeps.sh` builds the TypeScript and Sass, but it does a lot of other things as well.

To build Sass, run `gulp sass`. To watch the Sass for changes, run `gulp sass:watch`. Pass the `--debug` flag to enable sourcemaps and source comments.

To build TypeScript, run `gulp webpack-lf` or `gulp webpack-sf` to build for Language Forge or Scripture Forge respectively. To watch the files for changes, run `gulp webpack-lf:watch` or `gulp webpack-sf:watch`. This includes a live reload server to refresh the browser on TypeScript changes (browser setup [here](#livereload-chrome-extension)).

#### Language Forge Configuration File ####

If you are working with FLEx Send and Receive feature, manually edit the Language Forge config file

``` bash
sudo gedit /etc/languageforge/conf/sendreceive.conf
```

and modify PhpSourcePath to

``` bash
PhpSourcePath = /var/www/virtual/languageforge.org/htdocs
```

-------------------------------

### Windows 10 Setup ###
Before setting up a development environment on Windows 10, it is important to understand a couple of things about how WSL works.

1. You cannot make changes to the Linux filesystem from Windows, but you can make changes to the Windows filesystem from Linux. In practical terms, this means that any files that you want to be able to modify should be stored in the Windows filesystem. For example, Git repos should be cloned to the Windows filesystem. Windows drives are automatically mounted in Linux under the `/mnt` directory. A good practice is to store all Git repos in a directory on Windows, and then create a symbolic link to the directory in your home directory on Linux.
2. WSL is designed to only work with command-line tools. It cannot run GUI applications. This means that any GUI-based code editors or IDEs will need to be run in Windows.
3. Linux processes only run as long as a Bash shell is open. You can start a Bash shell on Ubuntu by running **Bash on Ubuntu on Windows** from the Start menu or by running `bash` from the command prompt. Once you close all Ubuntu Bash shells, all Linux processes will shutdown gracefully. This means that you will have to start any services that you need when you open an Ubuntu Bash shell.

#### Prerequisites ####

The first step is to install Ubuntu 16.04 on Windows. Follow the steps outlined on this [page](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide).

Download and install [Git for Windows](https://git-for-windows.github.io/). If you would like a full-fledged GUI for Git, you can install [Git Extensions](https://gitextensions.github.io/).

After, WSL and Git are installed, you will need to perform an Ansible-assisted setup [described here](https://github.com/sillsdev/ops-devbox) to install and configure a basic development environment. The **ops-devbox** repo will need to be cloned in Windows. You will also need to ensure that the repo is checked out with Unix line endings, so that Linux can read them properly.

To clone **ops-devbox** with Linux line endings, open **Git Bash** in Windows (not **Bash on Ubuntu on Windows**) and run:

``` bash
git clone --recurse-submodules --no-checkout https://github.com/sillsdev/ops-devbox
cd ops-devbox
git config core.autocrlf input
git checkout
```

Once the repo is cloned, you can install Ansible in Ubuntu and run the ansible scripts as outlined in the [**ops-devbox** README](https://github.com/sillsdev/ops-devbox).

#### Installation and Deployment ####

Follow the installation and deployment steps outlined in [Local Linux Development Setup](#local-linux-development-setup). Remember that you will need to clone the **xForge** repos in Windows with Unix line endings.

``` bash
git clone --recurse-submodules --no-checkout https://github.com/sillsdev/web-languageforge
cd web-languageforge
git config core.autocrlf input
git checkout
```

The rest of the steps should be performed in an Ubuntu Bash shell.

In order to access the local deployment of **xForge** apps, the local host names need to be added to Windows hosts file. The following lines should be added to the hosts file located at `C:\Windows\System32\drivers\etc\hosts`:

``` bash
127.0.0.1  languageforge.local
127.0.0.1  scriptureforge.local
```

#### Starting Services ####

All required Linux services must be restarted when you open the first Ubuntu Bash shell. You can start the services required for development with the following commands:

``` bash
sudo service postfix start
sudo service mongodb start
sudo service apache2 start
```

You can create a shell script that executes these commands in order to make it more convenient to start the services.

## Installing IDEs and Debugger ##

### Eclipse ###

Install Oracle Java JDK 8

``` bash
sudo add-apt-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java8-installer oracle-java8-set-default
```

Download the [Eclipse](http://www.eclipse.org/downloads/) installer, extract the tar folder and run the installer.

``` bash
tar xvf eclipse-inst-linux64.tar.gz
cd eclipse-installer
./eclipse-inst
```

From the installer, select **Eclipse IDE for PHP Developers**

Create a launcher shortcut from your *home* directory

``` bash
gedit .local/share/applications/eclipse.desktop
```

Replacing your *USERNAME*, paste the content below and save

``` bash
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

Once the MonjaDB plugin is installed, access `MonjaDB` from the Eclipse menu and select `Connect`. Set the database name to `scriptureforge` (both sites use the same database). Keep the other default settings and click `OK` and you should see the contents of the database.

### PhpStorm ###

Download [PhpStorm](https://www.jetbrains.com/phpstorm/download/#section=linux-version), extract the tar file and install.  You may need to modify newer version numbers accordingly...

``` bash
tar xvf PhpStorm-2016.2.1.tar.gz
sudo mv PhpStorm-162.1889.1/  /opt/phpstorm
sudo ln -s /opt/phpstorm/bin/phpstorm.sh /usr/local/bin/phpstorm
# launch
phpstorm
```

LSDev members can contact their team lead to get the SIL license information.  PhpStorm also has an option *Evaluate for free for 30 days*.

#### Coding Standard and Style ####

[Download](https://plugins.jetbrains.com/plugin/7294) the PhpStorm plugin for EditorConfig and then install:

**File** --> **Settings** --> **Plugins** --> **Install plugin from disk**

This uses the `.editorconfig` file at the root folder to enforce coding standards.

Also enable JSCS:

**File** -> **Settings** -> **Languages & Frameworks** -> **JavaScript** --> **Code Quality Tools**  --> **JSCS**

Set the *Enable* checkbox
Set *Node interpreter* to `usr/local/bin/node`
Set *JSCS package* to `/usr/local/bin/jscs`
Set *Search for config(s)* radio button to `.jscsrc or .jscs.json`
Set the *Code style preset* dropdown to `Airbnb`

Modify `/usr/local/lib/node_modules/jscs/presets/airbnb.json` and change `"requireTrailingComma": { "ignoreSingleLine": true }` to
`"disallowTrailingComma": true,`

#### Creating the PhpStorm Project ####

Launch PhpStorm.

Click **Create New Project from Existing Files**. Leave the default option (Web server is installed locally, source files are located under its document root) and click **Next**.

 From the **Create New Project: Choose Project Directory** dialog,  browse to the `web-languageforge` directory, then mark it as **Project Root** (using the `Project Root` button in the toolbar) and click **Next**.

From the **Add Local Server** dialog set
Name: `languageforge.local`
Web server root URL: `http://languageforge.local`
--> **Next** --> **Finish**

### Xdebug ###

Ansible will have installed Xdebug, but you still need to manually edit `/etc/php/7.0/apache2/php.ini` and append the following lines:

``` ini
[Xdebug]
xdebug.remote_enable = 1
xdebug.remote_port = 9000
xdebug.idekey=PHPSTORM
```

For more detailed installation instructions, reference the [Xdebug wizard](https://xdebug.org/wizard.php)

#### Integrating Xdebug with PhpStorm ####

Setting *PHP Interpreter* from PhpStorm

**File** --> **Settings** --> **Languages & Frameworks** --> **PHP**

From the dropdown to *PHP language level*, select `"7"`
For *Interpreter*, click `"..."` to browse, then `"+"`

- Name: PHP 7
- PHP executable: /usr/bin/php

Adding *Servers* from PhpStorm

**File** --> **Settings** --> **Languages & Frameworks** --> **PHP** --> **Servers**
Click the "+" to add the following Name & Hosts:

- default.local
- languageforge.local
- scriptureforge.local

Restart apache2

``` bash
sudo service apache2 restart
```

#### Xdebug helper Chrome extension ####

Install the [Xdebug helper](https://chrome.google.com/webstore/detail/xdebug-helper/eadndfjplgieldjbigjakmdgkmoaaaoc) extension which adds a bug icon to the top right area of Chrome extensions.

Right-click to select **Options** and set **IDE key**

- PhpStorm PHPSTORM

When it's time to Debug, check that the bug icon is green for **Debug**.

Then, from PhpStorm, click the telephone icon near the top right for *Start Listening for PHP Connections*.

Reference for [Integrating Xdebug with PhpStorm](https://www.jetbrains.com/help/phpstorm/2016.2/configuring-xdebug.html#integrationWithProduct).

### LiveReload ###

#### LiveReload Chrome extension ####

Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en-US) extension.

Then from PhpStorm, click
**View**->**Tool Windows** -> **Gulp**

When you want LiveReload running, double-click the **reload** or **build-webpack:watch** Gulp task.
Then in the LiveReload chrome extension, click to enable it.  A solid dot in the circle means the plugin is connected. Now when an applicable source file is changed and saved, it should trigger an automate page reload in the browser.

### Visual Studio Code ###

Visual Studio Code is a simple, free, cross-platform code editor. You can download VS Code from [here](https://code.visualstudio.com/).

The first time you open VS Code in the `web-languageforge` directory, it will recommend a list of extensions that are useful for developing **xForge** apps.

Build tasks have been setup to work on both Windows 10 and Linux. Tasks are available for performing webpack build, sass build, and npm install. Tasks are defined in the `.vscode/tasks.json` file.

Chrome debugging has also been configured. Launch configurations are defined in the `.vscode/launch.json` file.

## Testing ##

### PHP Unit Tests ###

Unit testing currently uses [PHPUnit](https://phpunit.de/) which was already installed by composer. To run them use `gulp test-php`.

#### Integrating PHPUnit with PhpStorm ####

**File** -> **Settings** -> **Languages & Frameworks** -> **PHP** -> **PHPUnit**

Under PHPUnit Library, select `Use Composer autoloader` option
For `Path to script` browse to `web-languageforge/src/vendor/autoload.php`

Under Test Runner
Select *Default configuration file* and browse to `web-languageforge/test/php/phpunit.xml`

Select *Default boostrap file* and browse to `web-languageforge/test/php/TestConfig.php`

To run tests, browse to the project view, right-click `test/php` and select `Run php`.

Note: at least one test will fail if the LFMerge (send/receive) program is not installed and available.  This is OK as long as you are not testing Send/Receive functionality.

### TypeScript Unit Tests ###

`gulp test-ts-lf` or `gulp test-ts-sf`

If you are doing a lot of testing use

`gulp test-ts-lf:watch` or `gulp test-ts-sf:watch`

TypeScript unit test spec files live in the `src` folder next to the relevant source file and have the file extension `.spec.ts`. Only E2E test specs will be in the `test` folder.

### End-to-End (E2E) Tests ###

E2E tests live in the `test` folder and have the file extension `.e2e-spec.ts`.

#### Install/Update Webdriver ####

From the `web-languageforge` directory

``` bash
npm install
gulp test-e2e-webdriver_update
```

#### E2E Test Run ####

From the *web-languageforge* directory, start **webdriver** in one terminal:

```` bash
gulp test-e2e-webdriver_standalone
````

Then to run **languageforge** tests in another terminal:

```` bash
./rune2e.sh lf
````

To run **scriptureforge** tests:

``` bash
./rune2e.sh sf
```

(If you get an error messages like `Error: ECONNREFUSED connect ECONNREFUSED 127.0.0.1:4444` you probably forgot to start the **webdriver**, see above)

To test a certain test spec, add a parameter `--specs [spec name]`.  For example,

``` bash
./rune2e.sh lf --specs lexicon-new-project
```

will run the the *lexicon-new-project.e2e-spec.ts* tests on **languageforge**.

To debug the tests:
- Do at least one of the following:
  * If you are going to debug in VSCode, place breakpoints in the tests.
  * Place breakpoints in your code (`debugger;` statements).
  * To pause the debugger on the first test failure, go to `test/app/protractorConf.js` and uncomment the line that adds the `pauseOnFailure` reporter.
- Start the tests with `./rune2e.sh`. Wait for the tests to actually start running before moving to the next steps.
- To debug in Chrome, go to `chrome://inspect/#devices`. Under "Remote Target" click to inspect the Node.js process.
- To debug in VSCode, select the "Node debugger" debug configuration and run it.

Unfortunately, debugging the e2e tests does not currently work very well because of the way WebDriver handles control flow.

## Get a copy of the live database ##

You need to have SSH access to the live database on [Language Forge](https://languageforge.org) or [Scripture Forge](https://scriptureforge.org).

(For installation of npm see https://github.com/nodesource/distributions)

Install gulp dependencies by running from the repo root (where):

    npm install

To install the mongodb databases locally, run:

``` bash
gulp mongodb-copy-prod-db
```

## Resetting MongoDB ##

If you want to _start over_ with your mongo database, you can use the factory reset script like so (this will delete all data in the mongodb):

```` bash
cd scripts/tools
./FactoryReset.php run
````

After a fresh factory reset, there is one user.  username: admin password: password

## Updating dependencies ##

Occasionally developers need to update composer or npm.  If something isn't working after a recent code change, try to update the dependencies using `./refreshDeps.sh lf` or `./refreshDeps sf`. If you know what has changed you can manually run some of the steps below.

### Update npm packages ###

In the *root* folder: `npm install`

### Update composer ###

In the **src/** folder: `composer install`

## Running the Node Server ##

To run the node server to get real time updating...

```` bash
cd src/node
sudo node server.js
````

## Setting up and running the Machine Web Server ##

### Installation and Deployment ###

From the **web-languageforge** repo root folder...

```` bash
cd ..
git clone git@github.com:sillsdev/machine.git
````

To deploy the machine server...

```` bash
cd machine/build
./deploy-local.sh
````

On a development machine call `build.sh` instead of `deploy-local.sh`:

``` bash
cd machine/build
./build.sh
```

### Running ###

To run the machine server...

```` bash
./run-developer.sh
````

Sometimes you may have to remove the `json` file in `/var/lib/languageforge/machine/data/build/` and then restart.

### Suggestion data ###

Copy `/var/lib/languageforge/machine/` from live server.
Add any project slugs to the `Projects` section of the `json` file in `/var/lib/languageforge/machine/data/engine/`.

## ElasticSearch Data ##

Before putting data into **ElasticSearch**, setup the index with settings and data mappings...

``` bash
./scripts/server/elasticSearch/setupElasticSearchCATIndex.sh
```

## Libraries used ##

[lamejs](https://github.com/zhuker/lamejs) is used for encoding recorded audio and is based on [LAME](http://lame.sourceforge.net/), which is licensed under the terms of [the LGPL](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
