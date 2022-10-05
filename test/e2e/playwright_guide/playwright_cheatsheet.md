# Playwright Cheatsheet - run and debug tests
## Most simple
1. install VSCode Extension: [*Playwright Test for VSCode*](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
1. `cd docker`
1. `make`
1. run tests directly with the extension in the side bar 
1. ![Screenshot showing VSCode Playwright extension](playwright_extension_sidebar.png "Playwright Test for VSCode")
1. or run tests directly from the spec files

![Screenshot showing extension in the file](playwright_extension_in_test_file.png)
### Debug tests
- debug tests by setting breakpoints in VSCode and select (right click on green triangle) *Debug Test*
## Simple
1. `cd docker`
1. `make playwright-tests`
This commands executes the playwright tests. Execution is specified in the makefile.
## More options
### Setup
1. `cd docker`
1. `make`
1. `cd ..`
1. `npx playwright test`
### Options
- run only a specific test file: `npx playwright test project.spec.ts`
- run only a specific test: add `.only` to the test
![Screenshot showing how to add .only to a test](debugging_dot_only.png)
    - only tests which have the `.only` will be executed (one can add `.only` to multiple tests)
- view how the tests are run: `npx playwright test --headed`
- step through the single lines, clicking *next* : `npx playwright test --debug`

## Essential to know
1. delete all *storageState.json* files before running the tests: `rm *storageState*`
1. not all tests will be executed but Playwright will indicate how many were executed or skipped, e.g., *4 skipped*, *50 passed*. Tests are skipped when they are ought to be skipped (see screenshot below, `.skip`) or when something goes wrong, e.g. an error in the beforeAll leads to all tests of this block being skipped.

![Screenshot showing how to add .skip to a test](debugging_dot_skip.png)
