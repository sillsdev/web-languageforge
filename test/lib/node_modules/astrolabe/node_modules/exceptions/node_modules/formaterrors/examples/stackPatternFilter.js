var assert = require("assert");
var formatErrors = require("../lib/formatErrors");

var error = new Error("the error message");

console.log(formatErrors.STYLES.BOLD + "Original..." + formatErrors.STYLES.NORMAL);
console.log(error.stack);

console.log(formatErrors.STYLES.BOLD + "\nFilter In Patterns");
console.log("===================" + formatErrors.STYLES.NORMAL);

console.log(formatErrors.STYLES.BOLD + "\nSingle Pattern");
console.log("--------------" + formatErrors.STYLES.NORMAL);
var filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter"]);
console.log(filteredStack);

console.log(formatErrors.STYLES.BOLD + "\nMultiple Patterns");
console.log("------------------" + formatErrors.STYLES.NORMAL);
filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter", "Object"]);
console.log(filteredStack);

console.log(formatErrors.STYLES.BOLD + "\nFilter Out Patterns");
console.log("===================" + formatErrors.STYLES.NORMAL);

console.log(formatErrors.STYLES.BOLD + "\nSingle Pattern");
console.log("--------------" + formatErrors.STYLES.NORMAL);
filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter"], false);
console.log(filteredStack);

console.log(formatErrors.STYLES.BOLD + "\nMultiple Patterns");
console.log("------------------" + formatErrors.STYLES.NORMAL);
filteredStack = formatErrors.stackFilter(error.stack, ["stackPatternFilter", "Object"], false);
console.log(filteredStack);