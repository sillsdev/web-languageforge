<?php

use Api\Model\Languageforge\Lexicon\LexMultiValue;
use PHPUnit\Framework\TestCase;

class LexMultiValueTest extends TestCase
{
    public function doTest(array $one, array $two, array $expectedDifferences)
    {
        $multiValue1 = LexMultiValue::createFromArray($one);
        $multiValue2 = LexMultiValue::createFromArray($two);
        $differences = $multiValue1->differences($multiValue2);
        $this->assertEquals($expectedDifferences, $differences);
    }

    public function testDifferences()
    {
        $one = ["one"];
        $two = ["two"];
        $expectedDifferences = [
            "this" => json_encode($one),
            "other" => json_encode($two),
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testInsertionStillShowsWholeArrayDifferences()
    {
        $one = ["one"];
        $two = ["one", "two"];
        $expectedDifferences = [
            "this" => json_encode($one),
            "other" => json_encode($two),
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testRemovalStillShowsWholeArrayDifferences()
    {
        $one = ["one", "two"];
        $two = ["one"];
        $expectedDifferences = [
            "this" => json_encode($one),
            "other" => json_encode($two),
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testReorderingStillShowsWholeArrayDifferences()
    {
        $one = ["one", "two"];
        $two = ["two", "one"];
        $expectedDifferences = [
            "this" => json_encode($one),
            "other" => json_encode($two),
        ];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testSameArrayObject_NoDifferences()
    {
        $one = ["one", "two"];
        $two = $one;
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testEqualArraysButDifferentObjects_NoDifferences()
    {
        $one = ["one", "two"];
        $two = ["one", "two"];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testSameEmptyArrayObject_NoDifferences()
    {
        $one = [];
        $two = $one;
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }

    public function testEqualEmptyArraysButDifferentObjects_NoDifferences()
    {
        $one = [];
        $two = [];
        $expectedDifferences = [];
        $this->doTest($one, $two, $expectedDifferences);
    }
}
