# web-languageforge / web-scriptureforge #

[Language Forge](https://github.com/sillsdev/web-languageforge) and [Scripture Forge](https://github.com/sillsdev/web-scriptureforge) represent different websites, but have the same code base stored in seperate repositories for the purpose of  version control and issue tracking. Since they are related repos it is easy to merge from one to the other.

## Users ##

To use **Language Forge** go to [languageforge.org](https://languageforge.org).

To use **Scripture Forge** go to [scriptureforge.org](https://scriptureforge.org).

### User Problems ###

To report an issue for **Language Forge** go to [Language Forge issues](https://github.com/sillsdev/web-languageforge/issues).

To report an issue for **Scripture Forge** go to [Scripture Forge issues](https://github.com/sillsdev/web-scriptureforge/issues).

**Note:** Scan the list to make sure your issue hasn't already been reported. If not, click **New issue**.

## Special Thanks To ##

![BrowserStack Logo](https://raw.githubusercontent.com/sillsdev/web-languageforge/master/readme_images/browserstack-logo.png "BrowserStack")

For end-to-end test automation.

## Developers ##

We use [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) with two modifications:

* The Gitflow **master** branch is our **live** branch.
* The Gitflow **develop** branch is our **master** branch. All pull requests go against **master**.

We merge from **master** to testing (**qa** branch) then ship from **qa** to **live**.

### Builds ###
Status of builds from our continuous integration (CI) [server](https://build.palaso.org):

| Site            | Master Unit | Master E2E | QA | Live |
| --------------- | ----------- | ---------- | -- | ---- |
| Language Forge  | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt372)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeLive)/statusIcon)|
| Scripture Forge | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt270)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeLive)/statusIcon)|

Successful builds from our CI server deploy to:

| Site            | Master | QA | Live |
| --------------- | ------ | -- | ---- |
| Language Forge  | [dev.languageforge.org](https://dev.languageforge.org) | [qa.languageforge.org](https://qa.languageforge.org) | [languageforge.org](https://languageforge.org) |
| Scripture Forge | [dev.scriptureforge.org](https://dev.scriptureforge.org) | [qa.scriptureforge.org](https://qa.scriptureforge.org) | [scriptureforge.org](https://scriptureforge.org) |

## Style Guides ##

PHP code conforms to [PSR-2](http://www.php-fig.org/psr/psr-2/).

 * Add `php-cs-fixer` globally installed with *composer* (http://cs.sensiolabs.org/). Here is how to add it to **PhpStorm** (https://hackernoon.com/how-to-configure-phpstorm-to-use-php-cs-fixer-1844991e521f). Use it with the parameters `fix --verbose "$FileDir$/$FileName$"`.

JavaScript code conforms to [AirBNB JS style guide](https://github.com/airbnb/javascript). 

 * Using PhpStorm with JSCS helps a lot with automating this (see the section below on PhpStorm [Coding Standard and Style](#CodeStyle)).
 * We plan to use [Prettier](https://prettier.io/) with pre-commit hook after re-writing the whole repo with Prettier first.

## TypeScript Integration ##

We are in the process of moving our code base from JavaScript to [**TypeScript**](https://www.typescriptlang.org).

> Note: this repo is currently AngularJS (1.6) not Angular (2+).

As we make the conversion to TypeScript, we will be following the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure. This is an appropriate time to change structure and file names since most file contents will be changed anyway. The reason for following this is to make it easier, not only for new developers to the project (like the FLEx team and hired developers) but also to change to Angular (2+) later.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We are expecting that TypeScript will help us get things right from the beginning (catching things even as you type) as well as maintenance. We are expecting that it will be an easier transition for the FLEx team and that they will be able to help us with good typing, interfaces and class design.

Other useful resources:
 - [x] [angularjs-styleguide/typescript at master · toddmotto/angularjs-styleguide](https://github.com/toddmotto/angularjs-styleguide/tree/master/typescript#stateless-components)
 - [x] [AngularJS 1.x with TypeScript (or ES6) Best Practices by Martin McWhorter on CodePen](https://codepen.io/martinmcwhorter/post/angularjs-1-x-with-typescript-or-es6-best-practices)
 - [x] [What is best practice to create an AngularJS 1.5 component in Typescript? - Stack Overflow](https://stackoverflow.com/questions/35451652/what-is-best-practice-to-create-an-angularjs-1-5-component-in-typescript)
 - [x] [Don't Panic: Using ui-router as a Component Router](http://dontpanic.42.nl/2016/07/using-ui-router-as-component-router.html)
 - [x] [Lifecycle hooks in Angular 1.5](https://toddmotto.com/angular-1-5-lifecycle-hooks#onchanges)

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

Start with the Ansible-assisted setup [described here](https://github.com/sillsdev/ops-devbox) to install and configure a basic development environment.


#### Installation and Deployment
After creating your Ansible-assisted setup, clone this repository from your *home* folder...

````
mkdir src
cd src
mkdir xForge
cd xForge
git clone https://github.com/sillsdev/web-languageforge web-languageforge --recurse-submodules
````
The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder. If you've already cloned the repo without `--recurse-submodules`, run `git submodule update --init --recursive` to pull and initialize them.


If you want to run an independant repo for scriptureforge, clone its repo also...

```
git clone https://github.com/sillsdev/web-scriptureforge web-scriptureforge --recurse-submodules
```

Otherwise just create a symbolic link between languageforge and scriptureforge...

```
ln -s web-languageforge web-scriptureforge
```

Change the variable *mongo_path: /var/lib/mongodb* in `deploy/vars_palaso.yml`. Set it to a location where MongoDB should store its databases.
 - **Vagrant VM Setup**: uncomment line 6 and comment line 5
 - **Local Linux Development Setup**: uncomment line 5 and comment line 6 (or whatever is appropriate on your system, its best to have Mongo store databases on your HDD rather than SSD). Make sure the `mongodb` user has permission to read and write to the path you specify.

Run the following Ansible playbooks to configure Ansible and run both sites.

````
cd web-languageforge/deploy
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook -i hosts playbook_xenial.yml --limit localhost -K
````
If you run into an error on the `ssl_config : LetsEncrypt: Install packages` task, run the playbook again and that task should succeed the second time it is run.

Install dependencies used to build Sass files and run E2E tests
```
cd web-languageforge
npm install
gulp sass
gulp webpack-lf
```
or use `gulp webpack-sf` if you are working in **Scripture Forge**.

To watch Sass files for changes, run `gulp sass:watch`. The output will also be in a more readable format (rather than compressed as it is with `gulp sass`). You can also pass the `--debug` flag to enable source comments and source maps in comments in the output files.

To watch TypeScript files for changes, run `gulp webpack-lf:watch` or `gulp webpack-sf:watch`. This includes a live reload server to refresh the browser on TypeScript changes (browser setup [here](#LiveReloadInstall)).

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
sudo apt-get install oracle-java8-installer oracle-java8-set-default
```

Download the [Eclipse](http://www.eclipse.org/downloads/) installer, extract the tar folder and run the installer.

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

Once the MonjaDB plugin is installed, access `MonjaDB` from the Eclipse menu and select `Connect`. Set the database name to `scriptureforge` (both sites use the same database). Keep the other default settings and click `OK` and you should see the contents of the database.

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

#### Coding Standard and Style <a id="CodeStyle"></a>

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

```
[Xdebug]
xdebug.remote_enable = 1
xdebug.remote_port = 9000
xdebug.idekey=PHPSTORM
```

For more detailed installation instructions, reference the [Xdebug wizard](https://xdebug.org/wizard.php)

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

#### LiveReload Chrome extension <a id="LiveReloadInstall"></a>

Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en-US) extension.

Then from PhpStorm, click
**View**->**Tool Windows** -> **Gulp**

When you want LiveReload running, double-click the **reload** or **build-webpack:watch** Gulp task.
Then in the LiveReload chrome extension, click to enable it.  A solid dot in the circle means the plugin is connected. Now when an applicable source file is changed and saved, it should trigger an automate page reload in the browser.

## Testing ##

### PHP Unit Tests ###

Unit testing currently uses [PHPUnit](https://phpunit.de/) which was already installed by composer.

#### Integrating PHPUnit with PhpStorm ####

**File** -> **Settings** -> **Languages & Frameworks** -> **PHP** -> **PHPUnit**

Under PHPUnit Library, select `Use Composer autoloader` option
For `Path to script` browse to `web-languageforge/src/vendor/autoload.php`

Under Test Runner
Select *Default configuration file* and browse to `web-languageforge/test/php/phpunit.xml`

Select *Default boostrap file* and browse to `web-languageforge/test/php/TestConfig.php`

To run tests, browse to the project view, right-click `test/php` and select `Run php`.

Note: at least one test will fail if the LFMerge (send/receive) program is not installed and available.  This is OK as long as you are not testing Send/Receive functionality.

### JavaScript and TypeScript Unit Tests ###

`gulp test-js` or `gulp test-js:watch`

TypeScript unit test spec files live in the `src` folder next to the relevant source file. Only E2E test specs will be in the `test` folder (at least while they are still JS files).

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

## Get a copy of the live database ##

(For installation of npm see https://github.com/nodesource/distributions)

Install gulp dependencies by running from the repo root (where):

    npm install

To install the mongodb databases locally, run:

```
gulp mongodb-copy-prod-db
```

## Resetting MongoDB ##

If you want to _start over_ with your mongo database, you can use the factory reset script like so (this will delete all data in the mongodb):
````
cd scripts/tools
./FactoryReset.php run
````
After a fresh factory reset, there is one user.  username: admin password: password

## Updating dependencies ##

Occasionally developers need to update composer or npm.  If something isn't working after a recent code change, try to update the dependencies:

#### Update npm packages ####

In the *root* folder: `npm install`

#### Update composer ####

In the **src/** folder: `composer install`

## Running the Node Server ##

To run the node server to get real time updating...
````
cd src/node
sudo node server.js
````

## Setting up and running the Machine Web Server ##

### Installation and Deployment
From the **web-languageforge** repo root folder...
````
cd ..
git clone git@github.com:sillsdev/machine.git
cd machine
git checkout -b Translation origin/Translation
````

To deploy the machine server...
````
cd build
./deploy-developer.sh
````

### Running
To run the machine server...

````
./run-developer.sh
````

Sometimes you may have to remove the `json` file in `/var/lib/languageforge/machine/data/build/` and then restart.

### Suggestion data
Copy `/var/lib/languageforge/machine/` from live server.
Add any project slugs to the `Projects` section of the `json` file in `/var/lib/languageforge/machine/data/engine/`.
