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

## Style Guides ##

TypeScript follows the [Angular Style Guide](https://angular.io/guide/styleguide). This is opinionated not only about things like file name conventions but also file and folder structure.

To this end you'll also want to be familiar with [Upgrading from AngularJS](https://angular.io/guide/upgrade) particularly the [Preparation](https://angular.io/guide/upgrade#preparation) section.

We plan to use [Prettier](https://prettier.io/) with pre-commit hook after re-writing the whole repo with Prettier first.

## Developers ##

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

### Development Process ###
The initial plan is to use Github Pull Requests (PR).

The first task on a job is to create a feature. Branch off of the **sf-develop** branch.
```
git checkout sf-develop
git pull
git checkout -b feature/<featureName>
```
Then do some useful work and commit it.
```
git push origin feature/<featureName>
```

Rebase often (at least at the start of day, and before making PR). Force pushing to your own branch is fine.

Make PR's against the **sf-develop** branch. If the **sf-develop** branch has moved on since the feature branch was made, rebase your changes on top of the **sf-develop** branch before making your PR. 

Reviewers can and should rebase the completed PR change (default to squash and rebase unless commits have good reason to stay separate).
If the person reviewing feels comfortable to approve it they can. However if they want other eyes on it, mention it in a comment on the PR.
If you have minor changes to request on a PR you can say 'Make change X and then LGTM'. This means they can merge it themselves after the requested change.

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
| Scripture Forge Beta | - | [beta.qa.scriptureforge.org](https://beta.qa.scriptureforge.org) | [beta.scriptureforge.org](https://beta.scriptureforge.org) |
