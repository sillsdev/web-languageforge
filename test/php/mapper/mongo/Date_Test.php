<?php

use Api\Model\Mapper\MongoEncoder;
use Api\Model\Mapper\MongoDecoder;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestMongoDateModel
{
    public function __construct()
    {
        $this->date = new DateTime('2013-08-01');
    }

    public $date;
}

class TestMongoDateMapper extends UnitTestCase
{
    public function __construct()
    {
    }

    public function testEncodeDecode_Same()
    {
        $model = new TestMongoDateModel();
        $encoded = MongoEncoder::encode($model);
        $this->assertIsA($encoded['date'], 'MongoDate');
//          var_dump($encoded);

        $otherModel = new TestMongoDateModel();
        MongoDecoder::decode($otherModel, $encoded);
        $iso8601 = $otherModel->date->format(DateTime::ISO8601);
        $this->assertEqual($model->date, $otherModel->date);
//          var_dump($iso8601);

    }

    public function testEncodeDecode_HistoricalDate_Same()
    {
        $model = new TestMongoDateModel();
        $model->date = new DateTime('2001-01-01');
        $encoded = MongoEncoder::encode($model);
        $this->assertIsA($encoded['date'], 'MongoDate');

        $otherModel = new TestMongoDateModel();
        MongoDecoder::decode($otherModel, $encoded);
        $iso8601 = $otherModel->date->format(DateTime::ISO8601);
        $this->assertEqual($model->date, $otherModel->date);

    }

}
