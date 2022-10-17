<?php

use Api\Model\Languageforge\Lexicon\LexMultiText;
use PHPUnit\Framework\TestCase;

class LexMultiTextTest extends TestCase
{
    public function createMultitext(array $values)
    {
        $multiText = new LexMultiText();
        foreach ($values as $key => $value) {
            $multiText->form($key, $value);
        }
        return $multiText;
    }

    public function doTest($one, $two, $expectedDifferences)
    {
        $multiText1 = $this->createMultitext($one);
        $multiText2 = $this->createMultitext($two);
        $differences = $multiText1->differences($multiText2);
        $this->assertEquals($expectedDifferences, $differences);
    }

    public function testSameTextDifferentInputSystems()
    {
        $one = ["fr" => "bonjour"];
        $two = ["en" => "bonjour"];
        $expectedDifferences = [
            ["inputSystem" => "fr", "this" => "bonjour", "other" => ""],
            ["inputSystem" => "en", "this" => "", "other" => "bonjour"],
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testEmptyStringInOneInputSystem()
    {
        $one = ["fr" => "bonjour"];
        $two = ["fr" => ""];
        $expectedDifferences = [["inputSystem" => "fr", "this" => "bonjour", "other" => ""]];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testOneInputSystemRemoved()
    {
        $one = ["fr" => "bonjour"];
        $two = [];
        $expectedDifferences = [["inputSystem" => "fr", "this" => "bonjour", "other" => ""]];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testOneInputSystemAdded()
    {
        $one = [];
        $two = ["fr" => "bonjour"];
        $expectedDifferences = [["inputSystem" => "fr", "this" => "", "other" => "bonjour"]];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testSameDataNoDifferences()
    {
        $one = ["fr" => "bonjour"];
        $two = ["fr" => "bonjour"];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testSameDataMultipleInputSystemsNoDifferences()
    {
        $one = ["fr" => "bonjour", "en" => "hello"];
        $two = ["fr" => "bonjour", "en" => "hello"];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testBothEmptyNoDifferences()
    {
        $one = ["fr" => ""];
        $two = ["fr" => ""];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testNullInBothComparedBothWays()
    {
        $one = ["fr" => null];
        $two = ["fr" => null];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
        $this->doTest($two, $one, $expectedDifferences);
    }

    public function testNullIsEquivalentToEmptyBothWays()
    {
        $one = ["fr" => null];
        $two = ["fr" => ""];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
        $this->doTest($two, $one, $expectedDifferences);
    }

    public function testTwoSetsOfChanges()
    {
        $one = ["fr" => "bonjour", "en" => "hello"];
        $two = ["fr" => "au revoir", "en" => "goodbye"];
        $expectedDifferences = [
            ["inputSystem" => "fr", "this" => "bonjour", "other" => "au revoir"],
            ["inputSystem" => "en", "this" => "hello", "other" => "goodbye"],
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testTwoChangesAndOneDeletion()
    {
        $one = ["fr" => "bonjour", "en" => "hello", "xyz" => "will be deleted"];
        $two = ["fr" => "au revoir", "en" => "goodbye"];
        $expectedDifferences = [
            ["inputSystem" => "fr", "this" => "bonjour", "other" => "au revoir"],
            ["inputSystem" => "en", "this" => "hello", "other" => "goodbye"],
            ["inputSystem" => "xyz", "this" => "will be deleted", "other" => ""],
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testTwoChangesAndOneAddition()
    {
        $one = ["fr" => "bonjour", "en" => "hello"];
        $two = ["fr" => "au revoir", "en" => "goodbye", "xyz" => "will be deleted"];
        $expectedDifferences = [
            ["inputSystem" => "fr", "this" => "bonjour", "other" => "au revoir"],
            ["inputSystem" => "en", "this" => "hello", "other" => "goodbye"],
            ["inputSystem" => "xyz", "this" => "", "other" => "will be deleted"],
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testTwoChangesOneDeletionAndOneAddition()
    {
        $one = ["fr" => "bonjour", "en" => "hello", "xyz" => "will be deleted"];
        $two = ["fr" => "au revoir", "en" => "goodbye", "abc" => "is new"];
        $expectedDifferences = [
            ["inputSystem" => "fr", "this" => "bonjour", "other" => "au revoir"],
            ["inputSystem" => "en", "this" => "hello", "other" => "goodbye"],
            ["inputSystem" => "xyz", "this" => "will be deleted", "other" => ""],
            ["inputSystem" => "abc", "this" => "", "other" => "is new"],
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }
}
