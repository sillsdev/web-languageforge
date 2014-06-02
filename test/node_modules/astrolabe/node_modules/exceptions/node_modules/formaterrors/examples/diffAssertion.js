var assert = require("assert");
var formatErrors = require("../lib/formatErrors");

var theme = new formatErrors.StackTheme();
theme.messageLineHighlights = [formatErrors.STYLES.BOLD, formatErrors.STYLES.RED];
theme.stackHighlights = [formatErrors.STYLES.BOLD];
theme.stackHighlightPatterns = ["diffAssertion"];

var format = new formatErrors.StackFormat();
format.components = ["fileName", "lineNumber", "columnNumber"];

console.log(formatErrors.STYLES.BOLD + "Diff Assertion Highlighted");
console.log("------------------------" + formatErrors.STYLES.NORMAL);
try {
    assert.equal("I am the very model of a modern Major-General, I've information vegetable, animal, and mineral, I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical.",
        "I am the very model of a modern Major-General, I've information vegetable, and mineral, I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical.");
} catch (error) {
    console.log(formatErrors.STYLES.BOLD + "Original..." + formatErrors.STYLES.NORMAL);
    console.log(error.stack);
    console.log("\n");
    console.log(formatErrors.STYLES.BOLD + "Filename and position with some bold and red..." + formatErrors.STYLES.NORMAL);
    error = formatErrors.highlightError(formatErrors.formatStack(error, format), theme);
    console.log(error.stack);
}