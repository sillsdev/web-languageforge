# web-xforge

The existing site details are [here](https://github.com/sillsdev/web-languageforge/blob/master/README-legacy.md). This document is for the **Beta** sites.

[Language Forge](https://languageforge.org) and [Scripture Forge](https://scriptureforge.org) represent different websites, but have the same code base stored in one [repository](https://github.com/sillsdev/web-languageforge).

## Users

To use **Language Forge** go to [languageforge.org](https://languageforge.org).

To use **Scripture Forge** go to [scriptureforge.org](https://scriptureforge.org).

### User Problems

To report a user issue with the **Language Forge** application, email "issues @ languageforge dot org".

To report a user issue with the **Scripture Forge** application, email "issues @ scriptureforge dot org".

## Special Thanks To

For end-to-end test automation:

[![BrowserStack Logo](readme_images/browserstack-logo.png "BrowserStack")](https://www.browserstack.com/)

For error reporting:

[![Bugsnag logo](readme_images/bugsnag-logo.png "Bugsnag")](https://bugsnag.com/blog/bugsnag-loves-open-source)

## Developers

### Builds

Status of builds from our continuous integration (CI) [server](https://build.palaso.org):

| Site               | Master Unit                                                                                                              | Master E2E          | QA                                                                                                                      | Live         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| Scripture Forge v2 | ![Build Status](<https://build.palaso.org/app/rest/builds/buildType:(id:SFv2_ScriptureForgeMasterUnitTests)/statusIcon>) | not yet operational | ![Build Status](<https://build.palaso.org/app/rest/builds/buildType:(id:xForgeDeploy_ScriptureForgeQaBeta)/statusIcon>) | not yet live |

Successful builds from our CI server deploy to:

| Site               | QA                                                               | Live                                                       |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Scripture Forge v2 | [beta.qa.scriptureforge.org](https://beta.qa.scriptureforge.org) | [beta.scriptureforge.org](https://beta.scriptureforge.org) |

### Gitflow

We use [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) with two modifications:

- Our `live` branch is the the Gitflow `master` production branch.
- Our `master` branch is the Gitflow `develop` development branch. All pull requests go against `master`.

If you are working on a site _Beta_ then it looks like normal Gitflow and pull requests go against the relevant site development branch.

We merge from `master` to the QA testing branch, then ship from the QA branch to the live production branch.

| Site               | Development Branch | QA Branch | Production Branch |
| ------------------ | ------------------ | --------- | ----------------- |
| Scripture Forge v2 | `master`           | `sf-qa`   | `sf-live`         |

### Style Guides

TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We plan to use [Prettier](https://prettier.io/) with pre-commit hook after re-writing the whole repo with Prettier first.

### Layout

We use [Angular Flex-Layout](https://github.com/angular/flex-layout) with [Material Design components for Angular](https://material.angular.io/guides) including the [Material Design Icons](https://google.github.io/material-design-icons/).

### Recommended Development Environment

Our recommended development environment for web development is Linux Ubuntu GNOME.

- [Vagrant GUI Setup](#vagrant-gui-setup). A Vagrant box with xForge already installed is downloaded and set up on your machine. This is the easiest and cleanest to setup.
- [Local Linux Development Setup](#local-linux-development-setup). Everything is installed directly on your machine, which needs to be running Ubuntu 16.04. This is the best method because everything runs at full speed.

#### Vagrant GUI Setup

Install [VirtualBox](https://www.virtualbox.org/) and [Vagrant](https://www.vagrantup.com/) and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and setup **git** for you (at least _name_ and _email_ is needed in `.gitconfig`). Make sure virtualization is enabled in your BIOS.

Create a directory for the installation, such as `src/xForge`. Download the file [deploy/vagrant_xenial_gui/Vagrantfile](https://raw.githubusercontent.com/sillsdev/web-languageforge/sf-develop/deploy/vagrant_xenial_gui/Vagrantfile) to the directory where you want to install. Then open the command line to that directory and run `vagrant up`. This will download a box (it's about 5GB, so expect it to take a while) and run a few setup steps. When it is complete the virtual machine should be open. After compiling Scripture Forge, browse to http://localhost:5000 and use the default login credentials "admin" and "password".

#### Local Linux Development Setup

Start by installing Git and Ansible:

```shell
sudo add-apt-repository ppa:ansible/ansible
sudo apt update
sudo apt install -y git ansible
```

Now create a directory for installation and clone the repo:

```shell
git clone --recurse-submodules https://github.com/sillsdev/web-xforge
```

The `--recurse-submodules` is used to fetch many of the Ansible roles used by the Ansible playbooks in the deploy folder. If you've already cloned the repo without `--recurse-submodules`, run `git submodule update --init --recursive` to pull and initialize them.

Change the variable `mongo_path: /var/lib/mongodb` in `deploy/vars_palaso.yml`. Set it to a location where MongoDB should store its databases.

- **Vagrant VM Setup**: uncomment line 6 and comment line 5
- **Local Linux Development Setup**: uncomment line 5 and comment line 6 (or whatever is appropriate on your system, its best to have Mongo store databases on your HDD rather than SSD). Make sure the `mongodb` user has permission to read and write to the path you specify.

Run the following Ansible playbooks to configure Ansible and run both sites.

```bash
cd web-xforge/deploy
ansible-playbook -i hosts playbook_create_config.yml --limit localhost -K
ansible-playbook playbook_xenial.yml --limit localhost -K
```

### Development Process

The first task on a job is to create a feature branch. Branch off of the **master** branch.

```bash
git checkout master
git pull
git checkout -b feature/<featureName>
```

Then do some useful work and commit it. Then

```bash
git push origin feature/<featureName>
```

Rebase often (at least at the start of the day, and before making a PR). Force pushing to your own branch is fine (even during review).

Make PR's against the **master** branch. If the **master** branch has moved on since the feature branch was made, rebase your changes on top of the **master** branch before making your PR.

Ensure all [tests](#testing) are passing before submitting a PR.

We now use [Reviewable](https://reviewable.io/) for GitHub Pull Requests (PR). When submitting a PR, a **This change is Reviewable** link is added to the PR description. Remember to hit the **Publish** button after adding comments in Reviewable.

If the person reviewing feels comfortable to approve it they can. However if they want other eyes on it, mention it in a comment on the PR.
If you have minor changes to request on a PR you can say 'Make change X and then LGTM'. This means the person making the PR can merge it themselves after the requested change.
People merging PRs can and should rebase the completed PR change (default to squash and rebase unless commits have good reason to stay separate).

Delete the PR branch after merge.

### Reference

- Angular Tutorial https://angular.io/tutorial
- Angular https://angular.io/api
- Angular MDC https://trimox.github.io/angular-mdc-web/#/angular-mdc-web/button-demo/api
- Angular Material https://material.angular.io/components/categories
- TypeScript https://www.typescriptlang.org/docs/home.html
- JavaScript https://developer.mozilla.org/en-US/docs/Web/JavaScript
- ts-mockito https://github.com/NagRock/ts-mockito#ts-mockito--
- Mockito (for Java Mockito, but helps know how to use ts-mockito) http://static.javadoc.io/org.mockito/mockito-core/2.23.0/org/mockito/Mockito.html

## Testing

### .NET Unit Testing

To run back end unit tests, from the repo (repository) root

```bash
dotnet test
```

See documentation for [running tests](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-test?tabs=netcore21) and [writing tests](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-nunit).

### Angular Linting and Prettiering

To check TypeScript for readability, maintainability, and functionality errors, and to check a few other files for proper formatting. From the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
npm run prettier
ng lint
```

Or just use VS Code with this project's recommended extensions.

### Angular Unit Testing

To run front end unit tests, make sure `ng serve` and `dotnet run` are **not** running (_CTRL-C_ to end them), then from the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
CHROME_BIN=chromium-browser ng test
```

You can make the environment variable (`CHROME_BIN=chromium-browser`) permanent by following the instructions [here](https://help.ubuntu.com/community/EnvironmentVariables), then you can simply run `ng test`. The environment variable is already set in the vagrant.

`ng test` will monitor and run tests in a Chromium browser window. You can also monitor and run tests headlessly from the command line by running

```bash
src/SIL.XForge.Scripture/ClientApp/monitor-test-headless.sh
```

Or just run tests once without monitoring with

```bash
src/SIL.XForge.Scripture/ClientApp/test-headless.sh
```

You can filter the tests to compile and run by passing spec file names as arguments. For example,

```bash
src/SIL.XForge.Scripture/ClientApp/monitor-test-headless.sh some.component.spec.ts another.component.spec.ts
```

#### Debugging Unit Tests

The best way to debug Angular unit tests is with Chromium.

- Run `npm test` (which will include source maps, `ng test` does not)
- When the Chromium window appears, press _F12_
- Click the Sources tab
- Files might show up under `webpack://` or `context/localhost:dddd/src` or elsewhere, but you can always press _CTRL-P_ and type the name of a file to get there faster.

[This video](https://youtu.be/NVqplMyOZTM) has a live demo of the process.

#### Filtering Unit Tests

To run (or not to run) specific tests or fixtures, you can use the prefixes `f`ocus and e`x`clude, as in `fdescribe` or `fit` to run only the specified functions, or `xdescribe` and `xit` to skip running the specified functions (but all functions will still be built). To skip building extra tests, modify the filter in `src/SIL.XForge.Scripture/ClientApp/src/test.ts` per [these instructions](https://stackoverflow.com/a/50636750/3587084).

See documentation for [running tests](https://github.com/angular/angular-cli/wiki/test) and [writing tests](https://angular.io/guide/testing#testing).

### Angular End-To-End (E2E) Testing

To run E2E tests, make sure you are serving the app. From the repo root

```bash
cd src/SIL.XForge.Scripture/
dotnet run --environment "Testing"
```

In another terminal, from the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
./rune2e.sh
```

#### Debugging E2E Tests

To debug E2E tests, from the repo root

```bash
cd src/SIL.XForge.Scripture/
dotnet run --environment "Testing"
```

In another terminal, from the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
ng serve
```

Add a new line of `debugger;` to the `*.e2e-spec.ts` where you want it to break.

In another terminal, from the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
./rune2e.sh debug
```

Open `chrome://inspect/#devices` in Chromium and click **inspect**. This opens an instance of DevTools and immediately breaks the code at the top of the ng module. Hit continue (or F8) in your debugger to run your e2e tests, and hit any `debugger` statements in your code. Close the DevTools window to finish the tests.

### PWA Testing

To test the PWA (Progressive Web App), build the app for PWA testing and run the server without `ng serve`. From the repo root

```bash
cd src/SIL.XForge.Scripture/ClientApp/
ng build --configuration=pwaTest
```

In another terminal, from the repo root

```bash
cd src/SIL.XForge.Scripture/
dotnet run --start-ng-serve=no
```

**!!! IMPORTANT !!!** When you have finished testing, remove the built app `dist` folder. From the repo root

```bash
rm -rf src/SIL.XForge.Scripture/ClientApp/dist
```

## Backend Development

Normally when you run `dotnet run` it starts `ng serve` for you. This works great if you are developing on the front end as it watches for file changes and reloads your browser once it has compiled.

If you are developing on the backend this works better

```bash
cd src/SIL.XForge.Scripture/
dotnet watch run --start-ng-serve=listen
```

In another terminal

```bash
cd src/SIL.XForge.Scripture/ClientApp/
ng serve
```

When files change on the backend it will compile the changes automatically and now `ng serve` won't re-start every time.

## Database

The VS Code extension [Azure Cosmos DB](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-cosmosdb) can be used to inspect our Mongo DB.

## Debugging

In Visual Studio Code, in the debug sidebar, choose **Full App (SF)** to debug the front-end and back-end at the same time, or **Launch Chrome (SF)** or **.NET Core (SF)** to just debug the front-end or back-end.

## Code Generator

In Visual Studio Code, ensure `dotnet` is not running, then click **Terminal** > **Run Task** > **Generate SF model**.
