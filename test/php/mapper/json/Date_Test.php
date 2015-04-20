<?php

use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestJsonDateModel
{
    public function __construct()
    {
        $this->date = new DateTime('2013-08-01');
    }

    public $date;
}

class TestJsonDateMapper extends UnitTestCase
{
    public function __construct()
    {
    }

    public function testEncodeDecode_Same()
    {
        $model = new TestJsonDateModel();
        $encoded = JsonEncoder::encode($model);
        $this->assertIsA($encoded['date'], 'string');
//         var_dump($encoded);

        $otherModel = new TestJsonDateModel();
        JsonDecoder::decode($otherModel, $encoded);
        $iso8601 = $otherModel->date->format(DateTime::ISO8601);
        $this->assertEqual($encoded['date'], $iso8601);

//         var_dump($iso8601);

    }

}
