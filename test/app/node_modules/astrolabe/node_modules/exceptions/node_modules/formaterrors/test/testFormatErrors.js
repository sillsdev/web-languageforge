var assert = require("assert");
var loadModule = require("./testHelpers/moduleLoader.js").loadModule;
var should = require("should");
var util = require("util");

var formatErrorsModule = loadModule("./lib/formatErrors.js");
var formatErrorsExports = formatErrorsModule.module.exports;

exports.testStackRange = function (test) {
    try {
        throw new Error("an error");
    } catch (error) {
        var formatted = formatErrorsExports.stackRange(error.stack, 0, 5);
        var lines = formatted.split('\n');
        should.equal(6, lines.length);
        should.equal("Error: an error", lines[0]);
        lines[1].should.include("testFormatError");

        formatted = formatErrorsExports.stackRange(error.stack, 1);
        lines = formatted.split('\n');
        lines[1].should.not.include("testFormatError");
        lines.length.should.be.above(5);
        lines[lines.length - 2].should.include("nodeunit");

        var another = formatErrorsExports.stackRange(error.stack, 0, 200);
        another.should.equal(another);
        another.should.equal(error.stack);

        formatted = formatErrorsExports.stackRange(error.stack, 0, 1);
        lines = formatted.split('\n');
        should.equal(2, lines.length);
        should.equal("Error: an error", lines[0]);
        lines[1].should.include("testFormatErrors");

        test.done();
    }
};

exports.testMultiLineMessageStackRange = function (test) {
    try {
        throw new Error("a multi\nline\nerror\nmessage");
    } catch (error) {
        var formatted = formatErrorsExports.stackRange(error.stack, 0, 5);
        var lines = formatted.split('\n');
        should.equal(9, lines.length);
        should.equal("Error: a multi", lines[0]);
        should.equal("message", lines[3]);
        lines[4].should.include("testFormatError");
        test.done();
    }
};

exports.testStackFilter = function (test) {
    try {
        throw new Error("an error");
    } catch (error) {
        var filters = ["testFormatErrors", "nodeunit"];
        var formatted = formatErrorsExports.stackFilter(error.stack, filters, true);
        var lines = formatted.split("\n");
        lines[1].should.include("testFormatErrors");
        for (var i = 2; i < lines.length - 1; i++) {
            lines[i].should.include("nodeunit");
        }
        formatted.should.equal(error.stack);

        filters = ["testFormatErrors"];
        formatted = formatErrorsExports.stackFilter(error.stack, filters, true);
        lines = formatted.split("\n");
        lines[1].should.include("testFormatErrors");
        lines.length.should.equal(3);

        var another = formatErrorsExports.stackFilter(error.stack, filters);
        another.should.equal(formatted);

        filters = ["testFormatErrors", "nodeunit"];
        formatted = formatErrorsExports.stackFilter(error.stack, filters, false);
        lines = formatted.split("\n");
        for (i = 1; i < lines.length - 1; i++) {
            lines[i].should.not.include("nodeunit");
            lines[i].should.not.include("testFormatErrors");
        }

        test.done();
    }
};

exports.testMultiLineMessageStackFilter = function (test) {
    try {
        throw new Error("a multi\nline\nerror\nmessage");
    } catch (error) {
        var filters = ["testFormatErrors", "nodeunit"];
        var formatted = formatErrorsExports.stackFilter(error.stack, filters, true);
        formatted.should.equal(error.stack);
        formatted = formatErrorsExports.stackFilter(error.stack, filters, false);
        formatted.should.not.equal(error.stack);
        var lines = formatted.split("\n");
        for (var i = 0; i < lines.length; i++) {
            formatErrorsModule.isMessageLine(lines[i]).should.equal(true);
        }
        test.done();
    }
};

exports.testStackHighlight = function (test) {
    try {
        throw new Error("an error");
    } catch (error) {
        var patterns = ["testFormatErrors", "nodeunit"];
        var formatted = formatErrorsExports.stackHighlight(error.stack, patterns, formatErrorsExports.STYLES.RED);
        var lines = formatted.split("\n");
        lines[0].should.not.include(formatErrorsExports.STYLES.RED);
        lines[0].should.not.include(formatErrorsExports.STYLES.NORMAL);
        lines[1].should.include("testFormatErrors");
        lines[1].indexOf(formatErrorsExports.STYLES.RED).should.equal(0);
        lines[1].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[1].length - formatErrorsExports.STYLES.NORMAL.length);
        lines[1].should.not.include("undefined");
        for (var i = 2; i < lines.length - 1; i++) {
            lines[i].should.not.include("undefined");
            lines[i].should.include("nodeunit");
            lines[i].indexOf(formatErrorsExports.STYLES.RED).should.equal(0);
            lines[i].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[i].length - formatErrorsExports.STYLES.NORMAL.length);
        }
        patterns = ["testFormatErrors"];
        formatted = formatErrorsExports.stackHighlight(error.stack, patterns,
            [formatErrorsExports.STYLES.GREEN, formatErrorsExports.STYLES.BOLD]);
        lines = formatted.split("\n");
        lines[0].should.not.include(formatErrorsExports.STYLES.GREEN);
        lines[0].should.not.include(formatErrorsExports.STYLES.BOLD);
        lines[0].should.not.include(formatErrorsExports.STYLES.NORMAL);
        lines[1].should.include("testFormatErrors");
        lines[1].should.not.include("undefined");
        lines[1].indexOf(formatErrorsExports.STYLES.GREEN).should.equal(0);
        lines[1].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(formatErrorsExports.STYLES.GREEN.length);
        lines[1].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[1].length - formatErrorsExports.STYLES.NORMAL.length);
        for (i = 2; i < lines.length - 1; i++) {
            lines[i].should.not.include("undefined");
            lines[i].should.include("nodeunit");
            lines[i].should.not.include(formatErrorsExports.STYLES.GREEN);
            lines[i].should.not.include(formatErrorsExports.STYLES.BOLD);
            lines[i].should.not.include(formatErrorsExports.STYLES.NORMAL);
        }
        test.done();
    }
};

exports.testMultiLineMessageStackHighlight = function (test) {
    try {
        throw new Error("a multi\nline\nerror\nmessage");
    } catch (error) {
        var patterns = ["testFormatErrors", "nodeunit"];
        var formatted = formatErrorsExports.stackHighlight(error.stack, patterns, formatErrorsExports.STYLES.RED);
        var lines = formatted.split("\n");
        lines[0].should.not.include(formatErrorsExports.STYLES.RED);
        lines[0].should.not.include(formatErrorsExports.STYLES.NORMAL);
        lines[3].should.not.include(formatErrorsExports.STYLES.RED);
        lines[3].should.not.include(formatErrorsExports.STYLES.NORMAL);
        lines[4].should.include("testFormatErrors");
        lines[4].indexOf(formatErrorsExports.STYLES.RED).should.equal(0);
        lines[4].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[4].length - formatErrorsExports.STYLES.NORMAL.length);
        lines[4].should.not.include("undefined");
        for (var i = 5; i < lines.length - 1; i++) {
            lines[i].should.not.include("undefined");
            lines[i].should.include("nodeunit");
            lines[i].indexOf(formatErrorsExports.STYLES.RED).should.equal(0);
            lines[i].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[i].length - formatErrorsExports.STYLES.NORMAL.length);
        }
        test.done();
    }
};

exports.testStackFilterNoFilters = function (test) {
    try {
        throw new Error("an error");
    } catch (error) {
        var formatted = formatErrorsExports.stackFilter(error.stack, null, true);
        var lines = formatted.split("\n");
        lines.length.should.equal(2);
        formatted = formatErrorsExports.stackFilter(error.stack, null, false);
        lines = formatted.split("\n");
        lines.length.should.be.above(10);
        formatted.should.equal(error.stack);

        test.done();
    }
};

exports.testStackFormatChaining = function (test) {
    try {
        var assertion = function() {
            false.should.equal(true);
        };
        assertion();
    } catch (error) {
        var formatted = formatErrorsExports.stackHighlight(
            formatErrorsExports.stackHighlight(
                formatErrorsExports.stackRange(error.stack, 2), ["testFormatErrors"], [formatErrorsExports.STYLES.BOLD], true
            ), ["Error:"], [formatErrorsExports.STYLES.BOLD, formatErrorsExports.STYLES.RED]
        );

        var lines = formatted.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[0].indexOf(formatErrorsExports.STYLES.RED).should.equal(formatErrorsExports.STYLES.BOLD.length);
        lines[0].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[0].length - formatErrorsExports.STYLES.NORMAL.length);
        for (var i = 1; i < 2; i++) {
            lines[i].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
            lines[i].should.not.include(formatErrorsExports.STYLES.RED);
            lines[i].should.not.include("should");
            lines[i].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[i].length - formatErrorsExports.STYLES.NORMAL.length);
        }
        for (i = 3; i < lines.length; i++) {
            lines[i].should.not.include("should");
            lines[i].should.not.include(formatErrorsExports.STYLES.BOLD);
            lines[i].should.not.include(formatErrorsExports.STYLES.RED);
            lines[i].should.not.include(formatErrorsExports.STYLES.NORMAL);
        }
        test.done();
    }
};

exports.testApplyHighlightStackFormat = function (test) {
    try {
        true.should.equal(false);
    } catch (error) {
        var formatted = formatErrorsExports.applyStackHighlights(
            error.stack,
            [formatErrorsExports.STYLES.BLUE, formatErrorsExports.STYLES.BOLD],
            [formatErrorsExports.STYLES.BOLD],
            ["testFormatErrors"]
        );
        var lines = formatted.split("\n");
        lines[2].should.include("testFormatErrors");
        lines[2].should.not.include("undefined");
        test.done();
    }
};

exports.testHighlightStackMessage = function (test) {
    try {
        true.should.equal(false);
    } catch (error) {
        var formatted = formatErrorsExports.highlightStackMessage(error.stack, [formatErrorsExports.STYLES.BLUE]);
        var lines = formatted.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BLUE).should.equal(0);
        lines[0].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[0].length - formatErrorsExports.STYLES.NORMAL.length);
        formatted = formatErrorsExports.highlightStackMessage(error.stack, [formatErrorsExports.STYLES.CYAN, formatErrorsExports.STYLES.BOLD]);
        lines = formatted.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.CYAN).should.equal(0);
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(formatErrorsExports.STYLES.CYAN.length);
        lines[0].indexOf(formatErrorsExports.STYLES.NORMAL).should.equal(lines[0].length - formatErrorsExports.STYLES.NORMAL.length);
        for (var i = 1; i < lines.length; i++) {
            lines[i].should.not.include(formatErrorsExports.STYLES.CYAN);
            lines[i].should.not.include(formatErrorsExports.STYLES.BOLD);
            lines[i].should.not.include(formatErrorsExports.STYLES.NORMAL);
        }

        test.done();
    }
};

exports.testBoldMessageBoldModuleStack = function (test) {
    try {
        true.should.equal(false);
    } catch (error) {
        var formatted = formatErrorsExports.boldMessageBoldModuleStack(error.stack, "testFormatErrors");
        var lines = formatted.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[1].should.not.include(formatErrorsExports.STYLES.BOLD);
        lines[2].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[3].should.not.include(formatErrorsExports.STYLES.BOLD);
        test.done();
    }
};

exports.testBoldError = function (test) {
    try {
        true.should.equal(false);
    } catch (error) {
        var formatted = formatErrorsExports.boldError(error, "testFormatErrors");
        var lines = formatted.stack.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[1].should.not.include(formatErrorsExports.STYLES.BOLD);
        lines[2].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[3].should.not.include(formatErrorsExports.STYLES.BOLD);
    }


    try {
        true.should.equal(false);
    } catch (error) {
        var noModule = formatErrorsExports.boldError(error);
        var noModuleLines = noModule.stack.split("\n");
        noModuleLines[0].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        noModuleLines[1].should.not.include(formatErrorsExports.STYLES.BOLD);
        noModuleLines[2].should.not.include(formatErrorsExports.STYLES.BOLD);
    }
    
    test.done();

};

exports.testStackLineType = function (test) {
    try {
        true.should.equal(false);
    } catch (error) {
        var lines = error.stack.split('\n');
        formatErrorsModule.isStackLine(lines[0]).should.equal(false);
        formatErrorsModule.isMessageLine(lines[0]).should.equal(true);
        for (var i = 1; i < lines.length; i++) {
            formatErrorsModule.isStackLine(lines[i]).should.equal(true);
            formatErrorsModule.isMessageLine(lines[i]).should.equal(false);
        }
        test.done();
    }
};

exports.testEnhanceError = function (test) {
    assert.throws(function () {
        formatErrorsModule.enhanceError("hello");
    });
    assert.doesNotThrow(function () {
        formatErrorsModule.enhanceError(new Error("message"));
    });
    test.done();
};

exports.testIsError = function (test) {
    formatErrorsModule.isError(new Error()).should.equal(true);
    formatErrorsModule.isError(7).should.equal(false);
    formatErrorsModule.isError("Error").should.equal(false);
    function EnhancedError() {
    }

    EnhancedError.prototype = new Error();
    EnhancedError.prototype.constructor = EnhancedError;

    var e2 = new EnhancedError();
    formatErrorsModule.isError(e2).should.equal(true);
    test.done();
};

exports.testGetMessages = function (test) {
    var messages = formatErrorsModule.getMessages(new Error("message"));
    messages[0].should.equal("Error: message");

    messages = formatErrorsModule.getMessages(new Error("message\nnext line"));
    messages.length.should.equal(2);
    messages[0].should.equal("Error: message");
    messages[1].should.equal("next line");

    test.done();
};

exports.testStackFormatObject = function (test) {
    var format = ['typeName', 'functionName', 'methodName', 'fileName', 'lineNumber', 'columnNumber'];
    var sf = new formatErrorsExports.StackFormat();
    sf.prefix.should.equal("    at");
    sf.components.length.should.equal(6);
    var c = sf.components;
    format.join().should.equal(c.join());

    test.done();
};

exports.testFormatStack = function (test) {
    var error = new Error("a message");

    var formatted = formatErrorsExports.formatStack(error);

    var lines = formatted.stack.split("\n");
    lines[0].should.equal("Error: a message");
    lines[1].should.include("test/testFormatErrors.js");
    lines[3].should.include("node_modules/nodeunit/lib/core.js:233:16");
    lines[4].should.include("node_modules/nodeunit/lib/core.js:69:9)");
    lines[10].should.include("node_modules/nodeunit/lib/types.js:146:17)");

    var format = new formatErrorsExports.StackFormat();

    format.prefix = "    \u2192";
    format.components = ["fileName", "lineNumber"];
    formatted = formatErrorsExports.formatStack(error, format);
    lines = formatted.stack.split("\n");

    lines[0].should.equal("Error: a message");
    lines[1].indexOf("    → ").should.equal(0);
    lines[1].should.include("testFormatErrors.js");
    lines[10].indexOf("    → ").should.equal(0);
    lines[10].should.include("node_modules/nodeunit/lib/types.js:146");

    test.done();
};

exports.testHighlightError = function (test) {
    var theme = new formatErrorsExports.StackTheme();
    var lines;
    theme.messageLineHighlights = [formatErrorsExports.STYLES.BOLD, formatErrorsExports.STYLES.RED];
    theme.stackHighlights = [formatErrorsExports.STYLES.BOLD];
    theme.stackHighlightPatterns = ["testFormatErrors"];

    try {
        true.should.equal(false);
    } catch (error) {
        var err1 = formatErrorsExports.highlightError(error, theme);
        should.not.exist(err1.diff);
        lines = err1.stack.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD + formatErrorsExports.STYLES.RED).should.equal(0);
        lines[0].should.include("AssertionError: expected true to equal false");
        lines[0].should.include(formatErrorsExports.STYLES.NORMAL);
        lines[2].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
        lines[3].should.not.include(formatErrorsExports.STYLES.RED);
        lines[3].should.not.include(formatErrorsExports.STYLES.BOLD);
        lines[3].should.not.include(formatErrorsExports.STYLES.NORMAL);
    }

    try {
        assert.equal("I am the very model of a modern Major-General, I've information vegetable, animal, and mineral, I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical.",
            "I am the very model of a modern Major-General, I've information vegetable, and mineral, I know the kings of England, and I quote the fights historical, From Marathon to Waterloo, in order categorical.");
    } catch (error) {
        var err2 = formatErrorsExports.highlightError(error, theme);
        should.exist(err2.diff);
        lines = err2.stack.split("\n");
        lines[0].indexOf(formatErrorsExports.STYLES.BOLD + formatErrorsExports.STYLES.RED).should.equal(0);
        lines[0].indexOf("AssertionError").should.equal(9);
        lines[0].should.include("I am the very model of a modern Major-General");
        lines[1].should.equal("\u001b[1m\u001b[31mDifferences: 'actual': \"animal, \"\u001b[39m\u001b[22m");
        lines[2].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
    }

    try {
        assert.equal(true, false);
    } catch (error) {
        var err3 = formatErrorsExports.highlightError(error, theme);
        should.not.exist(err3.diff);
        lines = err3.stack.split("\n");
        lines[0].should.include("AssertionError: ");
        lines[1].indexOf(formatErrorsExports.STYLES.BOLD).should.equal(0);
    }
    test.done();
};
