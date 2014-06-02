var assert = require("assert");
var formatErrors = require("../lib/formatErrors");

var theme = new formatErrors.StackTheme();
theme.messageLineHighlights = [formatErrors.STYLES.BOLD, formatErrors.STYLES.RED];
theme.stackHighlights = [formatErrors.STYLES.BOLD];
theme.stackHighlightPatterns = ["formatAndTheme"];

var format = new formatErrors.StackFormat();
format.components = ["fileName", "lineNumber", "columnNumber"];

console.log(formatErrors.STYLES.BOLD + "Error Format and Theme");
console.log("-----------------------" + formatErrors.STYLES.NORMAL);
try {
    assert.equal(true, false);
} catch (error) {
    console.log(formatErrors.STYLES.BOLD + "Original..." + formatErrors.STYLES.NORMAL);
    console.log(error.stack);
    console.log("\n");
    console.log(formatErrors.STYLES.BOLD + "Filename and position with some bold and red..." + formatErrors.STYLES.NORMAL);
    error = formatErrors.highlightError(formatErrors.formatStack(error, format), theme);
    console.log(error.stack);
}