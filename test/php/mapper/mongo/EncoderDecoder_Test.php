<?php

use models\mapper\ArrayOf;

use models\mapper\MapOf;

use models\UserModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class CodecTest extends UserModel
{
    public function __construct($id = '')
    {
        $this->fruitsMap = new MapOf(
            function ($data) {
                if (array_key_exists('numOfSlices', $data)) {
                    return new Apple();
                } elseif (array_key_exists('peelThickness', $data)) {
                    return new Orange();
                } else {
                    return new Fruit();
                }
            }
        );

        $this->fruitsArray = new ArrayOf(
            function ($data) {
                if (array_key_exists('numOfSlices', $data)) {
                    return new Apple();
                } elseif (array_key_exists('peelThickness', $data)) {
                    return new Orange();
                } else {
                    return new Fruit();
                }
            }
        );
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

class TestMongoEncoderDecoder extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testMapOf_OneClass_Works()
    {
        $codecTest = new CodecTest();
        $apple1 = new Apple();
        $apple1->numOfSlices = 1;
        $apple2 = new Apple();
        $apple2->numOfSlices = 2;
        $codecTest->fruitsMap['apple1'] = $apple1;
        $codecTest->fruitsMap['apple2'] = $apple2;
        $id = $codecTest->write();

        $codecTest2 = new CodecTest($id);
        $this->assertTrue(array_key_exists('apple1', $codecTest2->fruitsMap));
        $this->assertTrue(array_key_exists('apple2', $codecTest2->fruitsMap));
        $this->assertEqual($codecTest2->fruitsMap['apple1']->numOfSlices, 1);
        $this->assertEqual($codecTest2->fruitsMap['apple2']->numOfSlices, 2);

    }

    public function testMapOf_TwoClasses_Works()
    {
        $codecTest = new CodecTest();
        $apple = new Apple();
        $apple->numOfSlices = 5;
        $orange = new Orange();
        $orange->peelThickness = 'thick';
        $codecTest->fruitsMap['apple'] = $apple;
        $codecTest->fruitsMap['orange'] = $orange;
        $id = $codecTest->write();

        $codecTest2 = new CodecTest($id);
        $this->assertTrue(array_key_exists('apple', $codecTest2->fruitsMap));
        $this->assertTrue(array_key_exists('orange', $codecTest2->fruitsMap));
        $this->assertEqual($codecTest2->fruitsMap['apple']->numOfSlices, 5);
        $this->assertEqual($codecTest2->fruitsMap['orange']->peelThickness, 'thick');

    }

    public function testArrayOf_OneClass_Works()
    {
        $codecTest = new CodecTest();
        $apple1 = new Apple();
        $apple1->numOfSlices = 1;
        $apple2 = new Apple();
        $apple2->numOfSlices = 2;
        $codecTest->fruitsArray[] = $apple1;
        $codecTest->fruitsArray[] = $apple2;
        $id = $codecTest->write();

        $codecTest2 = new CodecTest($id);
        $this->assertTrue(is_a($codecTest2->fruitsArray[0], 'Apple'));
        $this->assertTrue(is_a($codecTest2->fruitsArray[1], 'Apple'));
        $this->assertEqual($codecTest2->fruitsArray[0]->numOfSlices, 1);
        $this->assertEqual($codecTest2->fruitsArray[1]->numOfSlices, 2);
    }

    public function testArrayOf_TwoClasses_Works()
    {
        $codecTest = new CodecTest();
        $apple = new Apple();
        $apple->numOfSlices = 5;
        $orange = new Orange();
        $orange->peelThickness = 'thick';
        $codecTest->fruitsArray[] = $apple;
        $codecTest->fruitsArray[] = $orange;
        $id = $codecTest->write();

        $codecTest2 = new CodecTest($id);
        $this->assertTrue(is_a($codecTest2->fruitsArray[0], 'Apple'));
        $this->assertTrue(is_a($codecTest2->fruitsArray[1], 'Orange'));
        $this->assertEqual($codecTest2->fruitsArray[0]->numOfSlices, 5);
        $this->assertEqual($codecTest2->fruitsArray[1]->peelThickness, 'thick');

    }

}
