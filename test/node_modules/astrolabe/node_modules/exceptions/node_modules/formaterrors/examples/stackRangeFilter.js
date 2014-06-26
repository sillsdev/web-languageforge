var assert = require("assert");
var formatErrors = require("../lib/formatErrors");

console.log(formatErrors.STYLES.BOLD + "Filter In Only First 2 Stack Lines");
console.log("----------------------------------"  + formatErrors.STYLES.NORMAL);
var error = new Error("the error message");
var rangedStack = formatErrors.stackRange(error.stack, 0, 2);
console.log(rangedStack);

console.log(formatErrors.STYLES.BOLD + "\nFilter Out First 2 Stack Lines");
console.log("------------------------------" + formatErrors.STYLES.NORMAL);
rangedStack = formatErrors.stackRange(error.stack, 2);
console.log(rangedStack);
