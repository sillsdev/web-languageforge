# Language Forge #

[Language Forge](https://languageforge.org) is an online service to collaborate on building a dictionary.

## Users ##

To use **Language Forge** go to [languageforge.org](https://languageforge.org).

### User Problems ###

To report an issue using the **Language Forge** service, email "languageforgeissues @ sil dot org".

## Special Thanks To ##
- ![BrowserStack Logo](readme_images/browserstack-logo.png "BrowserStack") for mobile device testing.
-
[![Bugsnag logo](readme_images/bugsnag-logo.png "Bugsnag")](https://bugsnag.com/blog/bugsnag-loves-open-source) for error reporting.

## Developers ##

We use [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) mostly, however we do not utilize a `develop` branch.  All work starts and returns to the `master` branch.  Deployment of software to a staging and/or a production environment occur through the use of the respective branches being fast-forwarded to the appropriate commit on `master` which will in turn kick off our automated deployment processes.

| Master Branch | Staging Branch (for testing) | Production Branch |
| ------------- | --------- | ----------- |
| `master` | `staging` | `prod` |

### CI Builds ###

Status of builds from our continuous integration (CI) [server](https://build.palaso.org):

| PHP Unit Tests | E2E Tests |
| ----------- | ---------- |
| [![Build Status](https://build.palaso.org/app/rest/builds/buildType:LanguageForgeDocker_PhpTests/statusIcon.svg)](https://build.palaso.org/buildConfiguration/LanguageForgeDocker_PhpTests) | [![Build Status](https://build.palaso.org/app/rest/builds/buildType:LanguageForgeDocker_E2eTests/statusIcon.svg)](https://build.palaso.org/buildConfiguration/LanguageForgeDocker_E2eTests) |

### Deployed Sites ###

| Staging | Production |
| -- | ---- |
| [qa.languageforge.org](https://qa.languageforge.org) | [languageforge.org](https://languageforge.org) |

## Style Guides ##

PHP code conforms to [PSR-2](http://www.php-fig.org/psr/psr-2/).

- Add `php-cs-fixer` globally installed with *composer* (http://cs.sensiolabs.org/). Here is how to add it to **PhpStorm** (https://hackernoon.com/how-to-configure-phpstorm-to-use-php-cs-fixer-1844991e521f). Use it with the parameters `fix --verbose "$FileDir$/$FileName$"`.

JavaScript code conforms to [AirBNB JS style guide](https://github.com/airbnb/javascript).

- Using PhpStorm with JSCS helps a lot with automating this (see the section below on PhpStorm [Coding Standard and Style](#coding-standard-and-style)).

### TypeScript Style Guide ###

Our code base has moved from JavaScript to [**TypeScript**](https://www.typescriptlang.org).

> Note: this repo is currently AngularJS (1.8) not Angular (2+).

Our TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure. This is an appropriate time to change structure and file names since most file contents will be changed anyway. The reason for following this is to make it easier, not only for new developers to the project (like the FLEx team and hired developers) but also to change to Angular (2+) later.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We are expecting that TypeScript will help us get things right from the beginning (catching things even as you type) as well as maintenance. We are expecting that it will be an easier transition for the FLEx team and that they will be able to help us with good typing, interfaces and class design.

Other useful resources:

- [x] [angularjs-styleguide/typescript at master · toddmotto/angularjs-styleguide](https://github.com/toddmotto/angularjs-styleguide/tree/master/typescript#stateless-components)
- [x] [AngularJS 1.x with TypeScript (or ES6) Best Practices by Martin McWhorter on CodePen](https://codepen.io/martinmcwhorter/post/angularjs-1-x-with-typescript-or-es6-best-practices)
- [x] [What is best practice to create an AngularJS 1.5 component in Typescript? - Stack Overflow](https://stackoverflow.com/questions/35451652/what-is-best-practice-to-create-an-angularjs-1-5-component-in-typescript)
- [x] [Don't Panic: Using ui-router as a Component Router](http://dontpanic.42.nl/2016/07/using-ui-router-as-component-router.html)
- [x] [Lifecycle hooks in Angular 1.5](https://toddmotto.com/angular-1-5-lifecycle-hooks#onchanges)

## Docker Development Environment ##

1. Install [Docker](https://www.docker.com/get-started) (Linux users will need some additional steps, please visit https://docs.docker.com/compose/install for info on installing the engine and compose)
1. Install [Make](https://www.gnu.org/software/make/).  This is actually optional but simplifies things a bit.
1. Clone the repo:  `git clone https://github.com/sillsdev/web-languageforge`
1. `cd web-languageforge/docker`

### Running the App Locally

1. `make`
1. Within any browser, navigate to https://localhost
1. Continue through any certificate warnings
1. You should see a landing page, click "Login"
1. Use `admin` and `password` to get in

> Sometimes there may be a need to hit the locally running app from a device other than the machine the app is running on.  In order to do that, you'll need to do the following:
> 1. Figure out your local ip address
> 1. Access the app via http at that address
> 
> On a Mac for example:
> ```
> ifconfig | grep broadcast
> 	inet 192.168.161.99 netmask 0xfffffc00 broadcast 192.168.163.255
> ```
> 
> then hit `http://192.168.161.99` from your phone or other device on the same network.
>
> NOTE: disabling cache on your device may not be trivial, you'll either need to wipe the site settings on your device's browser or you'll need to do it via USB debugging.

### Running E2E Tests

1. `make e2e-tests` (⚠️ these do not work on Apple Silicon at this time)
1. Individual test results will appear in your terminal but if you'd like to watch them in real-time, simply VNC into the running tests via `localhost:5900`, e.g., Mac OSX users simply `open vnc://localhost:5900` and use `secret` as the password.  Other operating systems may require installing a separate VNC Viewer tool.

To run a single E2E spec file, put its path (relative to the repo root) into the `TEST_SPECS` environment variable (don't forget to `export` it), or pass it as an option to `make e2e-tests` as follows:

```bash
make TEST_SPECS=test/app/languageforge/lexicon/lexicon-new-project.e2e-spec.js e2e-tests
# Or:
export TEST_SPECS=test/app/languageforge/lexicon/lexicon-new-project.e2e-spec.js
make e2e-tests
```

**Important:** the `TEST_SPECS` file must end in `.js`, not `.ts`, because the test runner we're using doesn't understand Typescript.

The easiest way to get the `TEST_SPECS` variable set up correctly is to go into VS Code and right-click the tab containing the spec file you want to run, then choose "Copy Relative Path" from the dropdown menu. Then do the following at the command line:

1. `export TEST_SPECS=`
1. Ctrl+V (or possibly Ctrl+Shift+V on a Linux command line)
1. Backspace over `.ts` and change it to `.js`
1. Enter
1. `make e2e-tests`

To quickly re-run the tests without going through the `make build` process, you can restart the `app-for-e2e` container and run the tests as follows:
`docker-compose restart app-for-e2e && docker-compose run -e TEST_SPECS= test-e2e` where the relative path to the test spec file is optionally given after the `=` sign.

### Running Unit Tests

1. `make unit-tests`
1. Test results will appear in your terminal

### Debugging E2E Tests

You'll need the "Remote - Containers" extension (`ms-vscode-remote.remote-containers`) installed, and you'll need your version of Docker Compose to be at least 1.21. (The VS Code instructions say that the Ubuntu snap package for `docker-compose` is **not** supported, so if you don't have it installed already, go to https://github.com/docker/compose/releases and download an appropriate binary of the most recent release. On Linux, you should put that binary in `/usr/local/bin/docker-compose`, **not** in `/usr/bin`!)

1. Run `docker-compose --version` and make sure it's at least version 1.21

Now when you want to debug E2E tests, you can click on the small green square in the lower left corner of VS Code (it looks like `><`) and a menu will pop up. Choose **Reopen in Container**. This will build the `test-e2e` container and all its dependencies, and will then install VS Code inside the container and set up your local copy of VS Code to be communicating to the copy inside the container. For all intents and purposes, it will be as if you were running VS Code inside the container. If this is the first time you've done this, you might have to wait a minute or two: click on the "show log" link (lower right) if you want to see what's happening.

Once you're running VS Code inside the `test-e2e` container, you can do the following to run E2E tests in debug mode:

1. (Optional) Edit `.vscode/launch.json` inside the container and uncomment the `--` and `--specs=...` lines, and edit the second line with the filename(s) you want to run.
1. Click on the Run and Debug icon on the left side of VS Code (looks like a "play" triangle with a bug icon in front of it)
1. If **Debug E2E tests** isn't already selected in the dropdown, select it
1. Set breakpoints in the tests you want to debug
1. Click the green "play" icon just left of the debug dropdown

**NOTE:** If you try to step out of a test function, you may find yourself inside a file called `primordials.js` which is part of Node. This is a [VS Code bug](https://github.com/microsoft/vscode-js-debug/issues/980) that has not yet been fixed (as of June 2021). If that happens, simply go back to your test file, set a new breakpoint, and then click the **Continue** icon (or press <kbd>F5</kbd>) in the debug toolbar to get back into your code.

If you interrupt the E2E tests halfway through their run (easy to do when debugging), you might find that the test database gets into a situation where running the tests a second time causes lots of spurious failures. For example, if you interrupt the "change password" test right in the middle, after it has changed the test user's password but before it has reset the test user's password back to the original value, then a subsequent run of E2E tests will completely fail to run. If that's the case, you'll want to reset the E2E test app container so that it will re-run the test initialization script and reset the test database.

To reset the E2E test app container, simply choose the **Reset and debug E2E tests** option in the debugging dropdown instead of the **Debug E2E tests** option. Now you should be able to run the E2E tests again.

If you edit files in the `src` or `data` folders of the test container, these changes will be applied to the files in your Git repository. But to make those changes "stick", you might have to exit the test container and rebuild it. To do that:

1. Exit the E2E container (click the green container menu in the lower left corner of VS Code and choose "Reopen folder locally")
1. Hit `F1` or `Ctrl+Shift+P` and choose **Remote-Containers: Rebuild and Reopen in Container** (type "Rebuild" to find it quickly)

After a minute or two, your source or test changes should be applied and you should see the result of your changes when you run the E2E tests again.

### Cleanup

1. `make clean` is the most common, it shuts down and cleans up running containers
1. less commonly, if you need to blow away shared artifacts from previous runs, simply `make clean-volumes`
1. rarely needed but for a "start from scratch" environment, `make clean-powerwash`.

### Running dev

1. `make dev` will start the app in development mode, i.e. changes to source code will immediately be reflected in the locally running app.

### Building for deployment

1. Refer to `/.github/workflows/build-and-deploy-images.yml` for build commands.

### Visual Studio Code ###

Visual Studio Code is a simple, free, cross-platform code editor. You can download VS Code from [here](https://code.visualstudio.com/).

The first time you open VS Code in the `web-languageforge` directory, it will recommend a list of extensions that are useful for developing Language Forge.  Install all recommended extensions for the best experience.

Chrome and PHP debugging have also been configured. Launch configurations are defined in the `.vscode/launch.json` file.

## Debugging ##

### PHP Application Debugging ###

To debug the Language Forge application locally, follow these steps:
- run `make` or `make dev`
- In VS Code, set a breakpoint on a line of code that should be executed
- Click on the `Run and Debug` area of VS Code, then click the green play icon next to `XDebug` in the configuration dropdown.

![XDebug](readme_images/xdebug1.png "Debugging with XDebug")] 

- The VSCode status bar will turn orange when XDebug is active
- open the application in your web browser (`https://localhost`) and use the application such that you execute the code where you have a breakpoint set

A [tutorial on YouTube is available showing how to use XDebug and VSCode](https://www.youtube.com/watch?v=nKh5DHViKlA) to debug the LF back-end application.

### PHP Tests Debugging ###

To debug the PHP tests, follow these steps:
- uncomment the 3 lines in the docker-compose.yml file related to XDebug under the service section `test-php`:
```
       - XDEBUG_MODE=develop,debug
     extra_hosts:
       - "host.docker.internal:host-gateway
```
- In VS Code, set a breakpoint on a line of code in one of the PHP tests (in the `test/php` folder)
- Click on the `Run and Debug` area of VS Code, then click the green play icon next to `XDebug` in the configuration dropdown.

![XDebug](readme_images/xdebug1.png "Debugging with XDebug")] 

- The VSCode status bar will turn orange when XDebug is active
- run `make unit-tests` in the terminal
- VSCode will stop the unit test execution when the breakpoint is hit

A [tutorial on YouTube is available showing how to use XDebug and VSCode](https://www.youtube.com/watch?v=SxIORImpxrQ) to debug the PHP Tests.

Additional considerations:

If you encounter errors such as VSCode cannot find a file in the path "vendor", these source files are not available to VSCode as they are running inside Docker.  If you want to debug vendor libraries (not required), you will have to use Composer to download dependencies and put them in your source tree.

### E2E Tests - TODO Needs Updating/Review ###
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

## Application deployment ##
Language Forge is built to run in a containerized environment.  For now, Kubernetes is the chosen runtime platform.  Deployments are not currently automated and must be manually run with the appropriate credentials or from within our CD platform, TeamCity at this time.  Deployment scripts for k8s can be found in `docker/deployment`

### Staging (QA) ###
Staging deployments can be run with `VERSION=<some-docker-tag-or-semver> make deploy-staging`.

Current workflow:
1. merge commits into or make commits on `staging` branch
1. this will kick off the GHA (`.github/workflows/build-and-deploy-images.yml`) to build and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags)
1. then the deployment scripts can be run either manually or via the TeamCity deploy job

### Production ###
Production deployments can be run with `VERSION=<some-docker-tag-or-semver> make deploy-prod`.

Current workflow:
1. merge from `staging` into `master`
1. tag the desired commit on `master` with a `v#.#.#` format and push the tag
1. this will kick off the GHA (`.github/workflows/build-and-deploy-images.yml`) to build and publish the necessary images to Docker Hub (https://hub.docker.com/r/sillsdev/web-languageforge/tags)
1. then the deployment scripts can be run either manually or via the TeamCity deploy job

### Backup/Restore ###
Backups will be established automatically by LTOps and utilized by LF through the `storageClassName` property in a Persistent Volume Claim.  This storage class provided by LTOps establishes both a frequency and retention for a backup.  Any time a restoration is needed, the LF team will need to coordinate the effort with LTOps.  The process of restoring from a point in time will require the application be brought down for maintenance.  The process will roughly follow these steps:
1. Notify LTOps of the need to restore a backup (App team)
1. Coordinate a time to bring the app down for maintenance (LTOps/App team)
1. Scale the app down (LTOps/App team)
1. Initiate the Backup restore (LTOps)
1. Notify app team of the restoration completion (LTOps)
1. Scale the app up (LTOps/App team)
1. Test the app (App team)
1. Communicate maintenance completion

## Libraries Used ##

[lamejs](https://github.com/zhuker/lamejs) is used for encoding recorded audio and is based on [LAME](http://lame.sourceforge.net/), which is licensed under the terms of [the LGPL](https://www.gnu.org/licenses/old-licenses/lgpl-2.0.html).
