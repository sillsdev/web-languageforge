<?php

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class TestCodec extends UserModel
{
    public function __construct($id = "")
    {
        $this->fruitsMap = new MapOf(function ($data) {
            if (array_key_exists("numOfSlices", $data)) {
                return new Apple();
            } elseif (array_key_exists("peelThickness", $data)) {
                return new Orange();
            } else {
                return new Fruit();
            }
        });

        $this->fruitsArray = new ArrayOf(function ($data) {
            if (array_key_exists("numOfSlices", $data)) {
                return new Apple();
            } elseif (array_key_exists("peelThickness", $data)) {
                return new Orange();
            } else {
                return new Fruit();
            }
        });
        parent::__construct($id);
    }

    public $fruitsArray;

    public $fruitsMap;
}

class Fruit
{
    public $color;
}

class Apple extends Fruit
{
    public $numOfSlices;
}

class Orange extends Fruit
{
    public $peelThickness;
}

class MongoEncoderDecoderTest extends TestCase
{
    public function testMapOf_OneClass_Works()
    {
        $codecTest = new TestCodec();
        $apple1 = new Apple();
        $apple1->numOfSlices = 1;
        $apple2 = new Apple();
        $apple2->numOfSlices = 2;
        $codecTest->fruitsMap["apple1"] = $apple1;
        $codecTest->fruitsMap["apple2"] = $apple2;
        $id = $codecTest->write();

        $codecTest2 = new TestCodec($id);
        $this->assertArrayHasKey("apple1", $codecTest2->fruitsMap);
        $this->assertArrayHasKey("apple2", $codecTest2->fruitsMap);
        $this->assertEquals(1, $codecTest2->fruitsMap["apple1"]->numOfSlices);
        $this->assertEquals(2, $codecTest2->fruitsMap["apple2"]->numOfSlices);
    }

    public function testMapOf_TwoClasses_Works()
    {
        $codecTest = new TestCodec();
        $apple = new Apple();
        $apple->numOfSlices = 5;
        $orange = new Orange();
        $orange->peelThickness = "thick";
        $codecTest->fruitsMap["apple"] = $apple;
        $codecTest->fruitsMap["orange"] = $orange;
        $id = $codecTest->write();

        $codecTest2 = new TestCodec($id);
        $this->assertArrayHasKey("apple", $codecTest2->fruitsMap);
        $this->assertArrayHasKey("orange", $codecTest2->fruitsMap);
        $this->assertEquals(5, $codecTest2->fruitsMap["apple"]->numOfSlices);
        $this->assertEquals("thick", $codecTest2->fruitsMap["orange"]->peelThickness);
    }

    public function testArrayOf_OneClass_Works()
    {
        $codecTest = new TestCodec();
        $apple1 = new Apple();
        $apple1->numOfSlices = 1;
        $apple2 = new Apple();
        $apple2->numOfSlices = 2;
        $codecTest->fruitsArray[] = $apple1;
        $codecTest->fruitsArray[] = $apple2;
        $id = $codecTest->write();

        $codecTest2 = new TestCodec($id);
        $this->assertTrue(is_a($codecTest2->fruitsArray[0], "Apple"));
        $this->assertTrue(is_a($codecTest2->fruitsArray[1], "Apple"));
        $this->assertEquals(1, $codecTest2->fruitsArray[0]->numOfSlices);
        $this->assertEquals(2, $codecTest2->fruitsArray[1]->numOfSlices);
    }

    public function testArrayOf_TwoClasses_Works()
    {
        $codecTest = new TestCodec();
        $apple = new Apple();
        $apple->numOfSlices = 5;
        $orange = new Orange();
        $orange->peelThickness = "thick";
        $codecTest->fruitsArray[] = $apple;
        $codecTest->fruitsArray[] = $orange;
        $id = $codecTest->write();

        $codecTest2 = new TestCodec($id);
        $this->assertTrue(is_a($codecTest2->fruitsArray[0], "Apple"));
        $this->assertTrue(is_a($codecTest2->fruitsArray[1], "Orange"));
        $this->assertEquals(5, $codecTest2->fruitsArray[0]->numOfSlices);
        $this->assertEquals("thick", $codecTest2->fruitsArray[1]->peelThickness);
    }
}
