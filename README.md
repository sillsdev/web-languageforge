# web-languageforge / web-scriptureforge #

Although [web-languageforge](https://github.com/sillsdev/web-languageforge) and [web-scriptureforge](https://github.com/sillsdev/web-scriptureforge) represent different websites, they have the same code base but are stored in seperate repositories for the purpose of  version control and issue tracking. Since they are related repos it is easy to merge from one to the other.

## Installation ##

First clone this repository. From your *home* folder...

````
mkdir src
cd src
git clone https://github.com/sillsdev/web-languageforge xForge --recurse-submodules
cd xForge/deploy
ansible-playbook -i hosts dev.yml --limit localhost -K
````

> The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder.

Install the php packages, this can take awhile. Note that you must have [composer](https://getcomposer.org/) and [bower](http://bower.io/) installed to do this.

```
cd ../src
composer install
bower install
```

Install the node packages. We're using [gulp](http://gulpjs.com/) as our build runner which requires node and is available as a node package.

````
npm install
````

Further guidance can be found in our [README_DEVELOPERS](README_DEVELOPERS.md)
