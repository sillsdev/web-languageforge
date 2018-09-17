# web-languageforge / web-scriptureforge #

The existing site details are [here](README-legacy.md). This document is for the **Beta** sites.

[Language Forge](https://languageforge.org) and [Scripture Forge](https://scriptureforge.org) represent different websites, but have the same code base stored in one [repository](https://github.com/sillsdev/web-languageforge).

## Users ##

To use **Language Forge** go to [languageforge.org](https://languageforge.org).

To use **Scripture Forge** go to [scriptureforge.org](https://scriptureforge.org).

### User Problems ###

To report a user issue with the **Language Forge** application, email "issues @ languageforge dot org".

To report a user issue with the **Scripture Forge** application, email "issues @ scriptureforge dot org".

## Special Thanks To ##

For end-to-end test automation:

[![BrowserStack Logo](readme_images/browserstack-logo.png "BrowserStack")](https://www.browserstack.com/)

For error reporting:

[![Bugsnag logo](readme_images/bugsnag-logo.png "Bugsnag")](https://bugsnag.com/blog/bugsnag-loves-open-source)

## Developers ##

### Gitflow ###

We use [Gitflow](http://nvie.com/posts/a-successful-git-branching-model/) with two modifications:

- The Gitflow **master** branch is our **live** branch.
- The Gitflow **develop** branch is our **master** branch. All pull requests go against **master**.
 
If you are working on a site _Beta_ then it looks like normal Gitflow and pull requests go against the relevant site **develop** branch.

We merge from **master** to testing (**qa** branch) then ship from **qa** to **live**.

| Site            | Master Branch | QA Branch | Live Branch |
| --------------- | ------------- | --------- | ----------- |
| Language Forge  | `master` | `lf-qa` | `lf-live` |
| Scripture Forge | `master` | `sf-qa` | `sf-live` |
| Scripture Forge Beta | `sf-develop` | `sf-qa-beta` | `sf-live-beta` |

### Style Guides ###

TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We plan to use [Prettier](https://prettier.io/) with pre-commit hook after re-writing the whole repo with Prettier first.

### Development Process ###

The initial plan is to use Github Pull Requests (PR).

The first task on a job is to create a feature. Branch off of the **sf-develop** branch.
```bash
git checkout sf-develop
git pull
git checkout -b feature/<featureName>
```
Then do some useful work and commit it. Then
```bash
git push origin feature/<featureName>
```

Rebase often (at least at the start of the day, and before making a PR). Force pushing to your own branch is fine.

Make PR's against the **sf-develop** branch. If the **sf-develop** branch has moved on since the feature branch was made, rebase your changes on top of the **sf-develop** branch before making your PR.

Ensure all [tests](#testing) are passing before submitting a PR. 

Reviewers can and should rebase the completed PR change (default to squash and rebase unless commits have good reason to stay separate).
If the person reviewing feels comfortable to approve it they can. However if they want other eyes on it, mention it in a comment on the PR.
If you have minor changes to request on a PR you can say 'Make change X and then LGTM'. This means they can merge it themselves after the requested change.

Delete the PR branch after merge.

### Builds ###

Status of builds from our continuous integration (CI) [server](https://build.palaso.org):

| Site            | Master Unit | Master E2E | QA | Live |
| --------------- | ----------- | ---------- | -- | ---- |
| Language Forge  | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt372)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:LanguageForge_LanguageForgeLive)/statusIcon) |
| Scripture Forge | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:bt270)/statusIcon) | in transition | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeQa)/statusIcon) | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeLive)/statusIcon) |
| Scripture Forge Beta | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:ScriptureForge_ScriptureForgeDevelopUnitTests)/statusIcon) | not yet operational | ![Build Status](https://build.palaso.org/app/rest/builds/buildType:(id:xForgeDeploy_ScriptureForgeQaBeta)/statusIcon) | not yet live |

Successful builds from our CI server deploy to:

| Site            | Master | QA | Live |
| --------------- | ------ | -- | ---- |
| Language Forge  | [dev.languageforge.org](https://dev.languageforge.org) | [qa.languageforge.org](https://qa.languageforge.org) | [languageforge.org](https://languageforge.org) |
| Scripture Forge | [dev.scriptureforge.org](https://dev.scriptureforge.org) | [qa.scriptureforge.org](https://qa.scriptureforge.org) | [scriptureforge.org](https://scriptureforge.org) |
| Scripture Forge Beta | - | [beta.qa.scriptureforge.org](https://beta.qa.scriptureforge.org) | [beta.scriptureforge.org](https://beta.scriptureforge.org) |

### Layout ###

We use [Material Design components for Angular](https://material.angular.io/guides) including the [Material Design Icons](https://google.github.io/material-design-icons/).

## Testing ##

### .NET Unit Testing ###

To run back end unit tests, from the repo (repository) root
```bash
dotnet test
```

See documentation for [running tests](https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-test?tabs=netcore21) and [writing tests](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-nunit).

### Angular Linting ###

To check TypeScript for readability, maintainability, and functionality errors. From the repo root
```bash
cd src/SIL.XForge.Scripture/ClientApp/
ng lint
```

### Angular Unit Testing ###

To run front end unit tests make sure `ng serve` and `dotnet run` are **not** running (*ctrl + c* to end them), then from the repo root
```bash
cd src/SIL.XForge.Scripture/ClientApp/
CHROME_BIN=chromium-browser ng test
```

You can make the environment variable (`CHROME_BIN=chromium-browser`) permanent by following the instructions [here](https://help.ubuntu.com/community/EnvironmentVariables), then you can simply run `ng test`.

See documentation for [running tests](https://github.com/angular/angular-cli/wiki/test) and [writing tests](https://angular.io/guide/testing#testing).

### Angular End-To-End (E2E) Testing ###

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

#### Debugging E2E Tests ####

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

### Backend Development ###

Normally when you run `dotnet run` it starts `ng serve` for you. This works great if you are developing on the front end as it watches for file changes and reloads your browser once it has compiled.

If you are developing on the backend this works better
```bash
cd src/SIL.XForge.Scripture/
dotnet watch run --start-ng-serve=false
```
In another terminal
```bash
cd src/SIL.XForge.Scripture/ClientApp/
ng serve
```
When files change on the backend it will compile the changes automatically and now `ng serve` won't re-start every time.
