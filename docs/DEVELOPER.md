# Developer Guide

Welcome! We're glad that you are interested in helping develop Language Forge.

<details>
  <summary>Table of contents</summary>

- [Development Environment Quick Start](#development-environment-quick-start)
  - [Supported Development Environments](#supported-development-environments)
  - [IDE Developer Experience (DX)](#ide-developer-experience-dx)
  - [Project Setup](#project-setup)
  - [Running the App Locally](#running-the-app-locally)
  - [Mobile device testing on a branch](#mobile-device-testing-on-a-branch)
- [Tests](#tests)
  - [Running Playwright E2E Tests](#running-playwright-e2e-tests)
  - [Running Unit Tests](#running-unit-tests)
- [Other Commands](#other-commands)
  - [Cleanup](#cleanup)
  - [Running dev](#running-dev)
- [Debugging](#debugging)
  - [PHP Application Debugging](#php-application-debugging)
  - [Typescript AngularJS Application Debugging](#typescript-angularjs-application-debugging)
  - [PHP Test Debugging](#php-test-debugging)
  - [Playwright E2E Test Debugging](#playwright-e2e-test-debugging)
- [Style Guides](#style-guides)
  - [Angular & TypeScript](#angular--typescript)
  </details>

## Development Environment Quick Start

### Supported Development Environments

Development of Language Forge is supported using [VS Code](https://code.visualstudio.com/download) on Linux, MacOS or Windows

### IDE Developer Experience (DX)

While Docker is great way to encapsulate all of the dependencies, build tools and run-time environment of the application, IDEs usually require locally installed extensions, tools and runtimes in order to provide type checking, code hints, and debugging capabilities that make for a better developer experience. To this end, the following locally installed tools/dependencies may be installed for good DX:

- PHP 7.4
- Composer
- Node and npm
- .Net SDK

### Project Setup

1. Install [Docker](https://www.docker.com/get-started).
   1. Linux users will need some additional steps. Visit https://docs.docker.com/compose/install for info on installing the engine and compose.
   2. Windows users, use Ubuntu (WSL) and follow the instructions at https://docs.docker.com/engine/install/ubuntu/. Then:
      1. Start docker: `sudo service docker start`.
      2. Permit your user (and not just "sudo") to contact the Docker daemon: `sudo usermod -aG docker yourUsername && sudo chmod 666 /var/run/docker.sock`.
      3. (Optional) Configure docker to start on boot: `printf '[boot]\ncommand="service docker start"\n' | sudo tee /etc/wsl.conf` (assuming `/etc/wsl.conf` is currently unused).
2. Install [Make](https://www.gnu.org/software/make/): `sudo apt install make`.
3. Install [Node 16.14.0](https://nodejs.org/en/download/). We recommend using [nvm](https://github.com/nvm-sh/nvm#installation-and-update).
4. Clone the repo: `git clone https://github.com/sillsdev/web-languageforge`.
   1. Windows users, be sure to clone the project to the WSL file system (to keep VS Code, Git and the file system in sync)
5. Run `npm install` (required for git pre-commit hook with Prettier)

### Running the App Locally

1. `make`
2. Within any browser, navigate to https://localhost
3. Continue through any certificate warnings
4. You should see a landing page, click "Login"
5. Use `admin` and `password` to login

Note: The application is accessible via HTTP or HTTPS. HTTPS is required for service-worker functionality.

### Mobile device testing on a branch

Sometimes there may be a need to hit the locally running app from a device other than the machine the app is running on. In order to do that, you'll need to do the following:

**If your machine's firewall is already configured for external access e.g. you use Docker Desktop**

1. Figure out your local ip address
2. Access the app via http at that address

On a Mac for example:

```
ifconfig | grep broadcast
	inet 192.168.161.99 netmask 0xfffffc00 broadcast 192.168.163.255
```

then hit `http://192.168.161.99` from your phone or other device on the same network.

NOTE: disabling cache on your device may not be trivial, you'll either need to wipe the site settings on your device's browser or you'll need to do it via USB debugging.

**If your machine's firewall is not configured for external port 80/443 access, you can use ngrok**

[Here](https://gist.github.com/SalahHamza/799cac56b8c2cd20e6bfeb8886f18455) are instructions for installing ngrok on WSL (Linux Subsystem for Windows).
[Here](https://ngrok.com/download) are instructions for installing ngrok on Windows, Mac OS, Linux, or Docker.

Once ngrok is installed, run:
`./ngrok http http://localhost`
in a bash terminal. The same command with https://localhost may not work, so be careful to try http://localhost in particular.

ngrok will return two URLs, one http and one https, that contain what is being served in localhost. Test on another device using one or both of these URLs.

## Tests

### Running Playwright E2E Tests

Before running Playwright tests for the first time use `npx playwright install --with-deps chromium` to install chromium with its dependencies. It will ask for root access.
After Playwright updates, you'll likely need to run `npx playwright install` to update the browsers, but Playwright should provide fairly explicit failure logs if that's the case.

1. `make e2e-tests`
1. Test results will appear in your terminal

### Running Unit Tests

1. `make unit-tests`
1. Test results will appear in your terminal

## Other Commands

### Cleanup

1. `make clean` is the most common, it shuts down and cleans up running containers
1. `make clean-powerwash` for those times when you want to "start from scratch" again, i.e., blow away your database, shared assets and built images

### Running dev

1. `make dev` will start the legacy app in development mode, i.e. changes to source code will immediately be reflected in the locally running app.
1. `make next-dev` will start the next app in development mode, i.e. changes to source code will immediately be reflected in the locally running app. Access non-ssl: http://localhost
   > TODO: There is a desire to consolidate these into a single use case, `make dev`.

## Debugging

### PHP Application Debugging

To debug the Language Forge application locally, follow these steps:

- run `make` or `make dev`
- In VS Code, set a breakpoint on a line of code that should be executed
- Click on the `Run and Debug` area of VS Code, then click the green play icon next to `XDebug` in the configuration dropdown.

![XDebug](../readme_images/xdebug1.png "Debugging with XDebug")]

- The VSCode status bar will turn orange when XDebug is active
- open the application in your web browser (`https://localhost`) and use the application such that you execute the code where you have a breakpoint set

A [tutorial on YouTube is available showing how to use XDebug and VSCode](https://www.youtube.com/watch?v=nKh5DHViKlA) to debug the LF back-end application.

### Typescript AngularJS Application Debugging

> TODO - we need instructions on how to do this, setting breakpoints in VSCode and attaching to the Chrome debugger.

### PHP Test Debugging

To debug the PHP tests, follow these steps:

- In VS Code, set a breakpoint on a line of code in one of the PHP tests (in the `test/php` folder)
- Click on the `Run and Debug` area of VS Code, then click the green play icon next to `XDebug` in the configuration dropdown.

![XDebug](../readme_images/xdebug1.png) "Debugging with XDebug")

- The VSCode status bar will turn orange when XDebug is active
- run `make unit-tests` in the terminal
- VSCode will stop the unit test execution when the breakpoint is hit

A [tutorial on YouTube is available showing how to use XDebug and VSCode](https://www.youtube.com/watch?v=SxIORImpxrQ) to debug the PHP Tests.

Additional considerations:

If you encounter errors such as VSCode cannot find a file in the path "vendor", these source files are not available to VSCode as they are running inside Docker. If you want to debug vendor libraries (not required), you will have to use Composer to download dependencies and put them in your source tree.

### Playwright E2E Test Debugging

Head on over to [Hanna's tutorial on debugging Playwright E2E tests](../test/e2e/playwright_guide/playwright_cheatsheet.md) for more information.

## Style Guides

### Angular & TypeScript

Our front-end and E2E tests are written in [**TypeScript**](https://www.typescriptlang.org).

> Note: this repo is currently AngularJS (1.8) not Angular (2+).

Our TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide).

Other useful resources:

- [x] [angularjs-styleguide/typescript at master · toddmotto/angularjs-styleguide](https://github.com/toddmotto/angularjs-styleguide/tree/master/typescript#stateless-components)
- [x] [AngularJS 1.x with TypeScript (or ES6) Best Practices by Martin McWhorter on CodePen](https://codepen.io/martinmcwhorter/post/angularjs-1-x-with-typescript-or-es6-best-practices)
- [x] [What is best practice to create an AngularJS 1.5 component in Typescript? - Stack Overflow](https://stackoverflow.com/questions/35451652/what-is-best-practice-to-create-an-angularjs-1-5-component-in-typescript)
- [x] [Don't Panic: Using ui-router as a Component Router](http://dontpanic.42.nl/2016/07/using-ui-router-as-component-router.html)
- [x] [Lifecycle hooks in Angular 1.5](https://toddmotto.com/angular-1-5-lifecycle-hooks#onchanges)
