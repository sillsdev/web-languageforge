# web-languageforge / web-scriptureforge #

Although [web-languageforge](https://github.com/sillsdev/web-languageforge) and [web-scriptureforge](https://github.com/sillsdev/web-scriptureforge) represent different websites, they have the same code base but are stored in seperate repositories for the purpose of  version control and issue tracking. Since they are related repos it is easy to merge from one to the other.

## Installation ##

First clone this repository. From your *home* folder...

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
ansible-playbook -i hosts playbook_palaso.yml --limit localhost -K
````

Install the php packages, this can take awhile. Note that you must have [composer](https://getcomposer.org/) and [bower](http://bower.io/) installed to do this.

```
cd ../src
composer install
bower install
```
Install the node packages. We're using [gulp](http://gulpjs.com/) as our build runner which requires node and is available as a node package...

````
cd ..
npm install
````

Further guidance can be found in our [README_DEVELOPERS](README_DEVELOPERS.md)
