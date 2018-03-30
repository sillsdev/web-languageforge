<?php

use Api\Model\Shared\Mapper\MongoMapper;
use PHPUnit\Framework\TestCase;

class MongoMapperArrayTest extends TestCase
{
    private function doTest($oldData, $newData, $key, $expected, $msg) {
        $actual = MongoMapper::detectMoved($oldData, $newData, $key);
        $this->assertEquals($expected, $actual, $msg);
    }

    public function testDetectMoved_BasicScenario_ReturnsExpectedResult()
    {
        $oldData = [["id" => "abc", "data" => "foo"], ["id" => "def", "data" => "bar"]];
        $newData = [["id" => "def", "data" => "bar"], ["id" => "abc", "data" => "new foo"]];
        $key = "id";

        $expected = ["abc" => ["oldPos" => 0, "newPos" => 1], "def" => ["oldPos" => 1, "newPos" => 0]];
        $this->doTest($oldData, $newData, $key, $expected, "Basic test failed");
    }

    public function testDetectMoved_OneItemDeleted_ReturnsNullForNewPos()
    {
        $oldData = [["id" => "abc", "data" => "foo"], ["id" => "def", "data" => "bar"]];
        $newData = [["id" => "def", "data" => "bar"]];
        $key = "id";

        $expected = ["abc" => ["oldPos" => 0, "newPos" => null], "def" => ["oldPos" => 1, "newPos" => 0]];
        $this->doTest($oldData, $newData, $key, $expected, "Deleting an item should produce null in newPos");
    }

    public function testDetectMoved_OneItemAdded_ReturnsNullForOldPos()
    {
        $oldData = [["id" => "abc", "data" => "foo"]];
        $newData = [["id" => "def", "data" => "bar"], ["id" => "abc", "data" => "new foo"]];
        $key = "id";

        $expected = ["abc" => ["oldPos" => 0, "newPos" => 1], "def" => ["oldPos" => null, "newPos" => 0]];
        $this->doTest($oldData, $newData, $key, $expected, "Adding an item should produce null in oldPos");
    }
}
