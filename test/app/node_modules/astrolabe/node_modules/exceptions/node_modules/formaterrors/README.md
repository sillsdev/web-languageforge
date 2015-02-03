FormatErrors
============

An API that provides various options for formatting and highlighting Errors. May be useful for logging and test
frameworks for example.

Stack lines can be filtered in and out based on patterns and limited by range (e.g. lines 2 through 10). Stack lines
and error message can have highlights applied based on patterns. Finally stack lines can be formatted to include or
exclude available fields.

The API is quite flexible with a range of methods varying in level with means to specify custom highlights and
formats.

Styles
------

The following list of styles for stack lines and error messages are supported. These styles can be combined in some
circumstances for example BOLD and RED to produce a bold red highlight:

    * RED
    * GREEN
    * YELLOW
    * BLUE
    * PURPLE
    * CYAN
    * BOLD
    * NORMAL

Styles are specified using the STYLES constant e.g:

    var formatErrors = require("formaterrors");
    var bold = formatErrors.STYLES.BOLD;
    var red = formatErrors.STYLES.RED;


StackThemes
-----------

A StackTheme is the name given to the type of object that can be applied to an Error or Error.stack to
produce different highlighting and filtering of stack lines.

The following example creates a StackTheme that when applied highlights the message part of an Error or Error.stack
in bold red and highlights stack lines that include the word 'formatAndTheme' in bold. In addition a stack line range is
included that will cause all but the first 5 stack lines to be removed.

    var formatErrors = require("formaterrors");
    var theme = new formatErrors.StackTheme();
    theme.messageLineHighlights = [formatErrors.STYLES.BOLD, formatErrors.STYLES.RED];
    theme.stackHighlights = [formatErrors.STYLES.BOLD];
    theme.stackHighlightPatterns = ["formatAndTheme"];
    theme.stackRange.depth = 5;


StackFormats
------------

A StackFormat is a type of object that describes the fields to include in each line of an error stack trace. In addition
the stack line prefix (i.e. normally this is '    at') can be set. The available stack line fields are:

    * typeName
    * functionName
    * methodName
    * fileName
    * lineNumber
    * columnNumber

By default all fields are included.

The following example creates a StackFormat that only provides fileName, lineNumber and columnNumber stack line fields
with a prefix of "    -".

    var formatErrors = require("formaterrors");
    var format = new formatErrors.StackFormat();
    format.components = ["fileName", "lineNumber", "columnNumber"];
    format.prefix = "    -"


Installation
------------

    $ npm install formaterrors

Or include as a dependency within packakage.json and use: *npm link*.


Usage
-----

    var formatErrors = require("formaterrors");


Then invoke the provided APIs on instances of Error or Error.stack as required. Some examples are shown below.


Examples
--------

1. Highlight in bold the message and stacklines that include the module name of an error:

        var formatErrors = require("formaterrors");
        var error = new Error("the error message");
        var error = formatErrors.boldError(error, "testFormatErrors");
        console.log(error.stack);

2. Highlight an error using bold for the stacklines containing some pattern - say the name of a module. Also,
if the assertion message is long then the diff of the expected and actual are provided along with the expected and
actual values:

        var formatErrors = require("formaterrors");
        var stackTheme = new formatErrors.StackTheme();
        stackTheme.messageLineHighlights = [formatErrors.STYLES.BOLD];
        stackTheme.stackHighlights = [formatErrors.STYLES.BOLD];
        stackTheme.stackHighlightPatterns = ["testDocit"];
        throw formatErrors.highlightError(error, stackTheme);

3. From a stack trace, only show stack lines that include a specified value or values:

        var formatErrors = require("formaterrors");
        var error = new Error("the error message");
        var filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter", "Object"]);
        console.log(filteredStack);

4. From a stack trace, only show stack lines that do not include a specified value or values:

        var formatErrors = require("formaterrors");
        var error = new Error("the error message");
        var filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter", "Object"], false);
        console.log(filteredStack);

5. From a stack trace, only include the first 2 stack lines:

        var formatErrors = require("formaterrors");
        var error = new Error("the error message");
        var rangedStack = formatErrors.stackRange(error.stack, 0, 2);
        console.log(rangedStack);

6. From a stack trace, Include all but the first 2 stack lines:

        var formatErrors = require("formaterrors");
        var error = new Error("the error message");
        var rangedStack = formatErrors.stackRange(error.stack, 2);
        console.log(rangedStack);


Some examples are available within the *examples* folder. They can be executed as follows:

    $node examples/<file.js>

    
API Docs
--------

Types
-----

###StackFormat###

An object that describes the format of a stack line.


###StackTheme###

An object that may be used to define a theme for a a set operations (transformations) to apply to an error stack.


###STYLES###

Some provided styles for stackHighlight. These may be overridden or alternatives may be used as required.

boldError
---------

###exports.boldError = function (error, moduleName)###

Convenience method that styles an Error so that the message is bold. If a module name is also provided
then all stack lines containing that module name are also bold styled.

####Parameters####

* error *Error* the Error
* moduleName *String* optional module name or pattern whose matched StackLines are to be styled bold

####Returns####

the Error styled bold
* * *


highlightError
--------------

###exports.highlightError = function (error, stackTheme, stackFormat)###

Apply a StackTheme and an optional StackFormat to an error and return the result.

If the given error is an AssertionError with a long actual / expected then the diff of the actual / expected will
also be provided and added to the message part of the error.

####Parameters####

* error *Error* an Error to style
* stackTheme *StackTheme* the theme for the error
* stackFormat *StackFormat* optional StackFormat to apply formatting to the stack lines

####Returns####

*Error* the given Error with stack themed and formatted as required
* * *


formatStack
-----------

###exports.formatStack = function (error, stackFormat)###

Format the stack part (i.e. the stack lines not the message part in the stack) according to a specified StackFormat.
(See exports.StackFormat for available stack line fields.)

####Parameters####

* error *Error* the error whose stack to format
* stackFormat *StackFormat* the specification for the required format

####Returns####

*Error* the given error with its stack modified according to the given StackFormat
* * *


boldMessageBoldModuleStack
--------------------------

###exports.boldMessageBoldModuleStack = function (stack, moduleName)###

Convenience method that highlights the message line and all module related lines in bold.

####Parameters####

* stack *String* an Error stack (i.e. error.stack)
* moduleName *String* the name of a module whose stack lines to highlight in bold

####Returns####

*String* a new error stack with bold message and module entries.
* * *


applyStackHighlights
--------------------

###exports.applyStackHighlights = function (stack, messageLineHighlights, stackHighlights, stackPatterns, inclusive)###

Convenience method to apply a given set of highlights to a an error stack.

####Parameters####

* stack *String* an Error stack (i.e. error.stack)
* messageLineHighlights *String[]* an array of prefixes to be applied to the first line of the stack
(e.g. [exports.styles.RED, exports.styles.BOLD])
* stackHighlights *String[]* an array of prefixes to be applied to each line (e.g. [exports.styles.RED,
exports.styles.BOLD]) matching one or more of the provided "stackPatterns"
* stackPatterns *String[]* an array of regular expressions against which to perform match operations on each line of the stack
* inclusive *Boolean* use the patterns to include or exclude from the stack. Defaults to true.

####Returns####

*String* a new error stack String highlighted as specified by the parameters
* * *


applyStackTheme
---------------

###exports.applyStackTheme = function (stack, theme)###

Convenience method to apply multiple transformations to an error stack.

####Parameters####

* stack *String* an error stack (i.e. error.stack)
* theme *StackTheme* the theme for the stack

####Returns####

*String* a new error stack String transformed according to the specified StackFormat
* * *


highlightStackMessage
---------------------

###exports.highlightStackMessage = function (stack, highlights)###

Highlight just the first line of an error stack - i.e. the message part

####Parameters####

* stack *String* an Error stack (i.e. error.stack)
* highlights *String[]* an array of prefixes to be applied to each matching line (e.g. [exports.styles.RED,
exports.styles.BOLD])

####Returns####

*String* a new error stack with the given highlights applied to the message part
* * *


stackRange
----------

###exports.stackRange = function (stack, start, depthFromStart)###

Given an stack from an Error return a subset of the lines in the stack. The first line (aka the message) is always
included.

####Parameters####

* stack *String* the Error stack (i.e. error.stack)
* start *Number* the first line of the stack to include in the range. Note that the message lines are always included
as the real first lines regardless of the value of 'start'.
* depthFromStart *Number* optional number of lines from 'start' to include in the returned stack. If not provided the full
stack depth starting from 'start' is provided.

####Returns####

*String* a new error stack containing the specified range of lines from the provided stack.
* * *


stackFilter
-----------

###exports.stackFilter = function (stack, filters, inclusive)###

Filter lines of a stack in or out of the stack based on an array of regexp values. If a line matches a regexp then
it is either included or excluded in the returned stack based on the value of 'inclusive'.

####Parameters####

* stack *String* a stack from an Error (i.e. error.stack)
* filters *String[]* an array of regular expressions against which to perform match operations on each line of the
stack
* inclusive *Boolean* use the filters to include or exclude from the stack. Defaults to true.

####Returns####

*String* a new error stack filtered according to the 'filters' and 'inclusive' values
* * *


stackHighlight
--------------

###exports.stackHighlight = function (stack, patterns, highlights, inclusive)###

Apply highlights to an error stack including the message part (line 0 of error.stack) based on matching patterns.

####Parameters####

* stack *String* a stack from an Error (i.e. error.stack)
* patterns *String[]* an array of regular expressions against which to perform match operations on each line of the stack
* highlights an array of prefixes to be applied to each matching line (e.g. [exports.styles.RED,
exports.styles.BOLD])
* inclusive *Boolean* use the patterns to include or exclude from the stack. Defaults to true.

####Returns####

*String* a new error stack highlighted with the specified highlights according to the provided patterns
* * *


applyFilters
------------

###exports.applyFilters = function (includedAction, excludedAction, stack, filters, inclusive, includeMessage)###

Apply filters to the lines of an error.stack and call the includedAction or the excludedAction functions based on
the result of the match and the value of the 'inclusive' parameter. If based on the filter a stack line is included
includedAction is invoked with the current value of the stack under construction and the current stack line. Otherwise
excludedAction is called with the same arguments.

This function is common to higher level functions that operate based on stack line filtering and should only be
required to meet bespoke behaviour that cannot be achieved through the higher level functions (e.g.
exports.stackHighlight and exports.stackFilter).

Normally there should be no need to call this function directly.

####Parameters####

* {Function(stack, stackLine)} includedAction the function to call for stack lines that are included based on filters and inclusive parameters.
Function signature is: includedAction(stackUnderConstruction, includedStackLine) returning the updated
stackUnderConstruction.
* {Function(stack, stackLine)} excludedAction the function to call for stack lines that are excluded based on filters and inclusive parameters.
Function signature is: excludedAction(stackUnderConstruction, excludedStackLine) returning the updated
stackUnderConstruction.
* stack *String* a stack from an Error (i.e. error.stack)
* filters *String[]* an array of regular expressions against which to perform match operations on each line of the
stack
* inclusive *Boolean* use the filters to include or exclude from the stack. Defaults to true.
* includeMessage *Boolean* include the message part of the stack in the filtering operation

####Returns####

*String* a new error stack modified according to the results of calls to includedAction and excludedAction based on
filters provided and the inclusive parameter.
* * *


Testing
-------

Tests utilise [nodeunit](https://github.com/caolan/nodeunit). In addition jshint is run against both lib and test
javascript files.

First install the dependencies:

    $ npm link

Then to run the tests:

    $ npm test


Contributing
------------

Contributions are welcome. Please create tests for any updates and ensure jshint is run on any new files. Currently
npm test will run jshint on all lib and test javascript as well as running all the tests.


Bugs & Feature Suggestions
--------------------------

https://github.com/allanmboyd/formaterrors/issues


Known Limitations
-----------------

  * Changing the stack line prefix and subsequently applying stack highlights or theme is not likely to produce the
    desired result because the stack prefix is key to differentiating between the message and the stack lines parts of
    the error stack.



