<?php

use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Litipk\Jiffy\UniversalTimestamp;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestJsonDateModel
{
    public function __construct()
    {
        $this->dateTime =  new DateTime();
        $this->universalTimestamp = UniversalTimestamp::now();
    }

    public $dateTime;

    public $universalTimestamp;
}

class TestJsonDateMapper extends UnitTestCase
{
    const StringTimestamp = '2001-01-01 12:01:01';
    const StringTimestampWithMilliseconds = '2001-01-01 12:01:01.321';
    public function testEncodeDecodeDateTime_HistoricalDate_Same()
    {
        $model = new TestJsonDateModel();
        $model->dateTime = new DateTime(self::StringTimestamp);
        $model->universalTimestamp = UniversalTimestamp::fromStringTimestamp(self::StringTimestamp);
        $encoded = JsonEncoder::encode($model);
        $this->assertIsA($encoded['dateTime'], 'string');
//        var_dump($encoded);

        $decodedModel = new TestJsonDateModel();
        JsonDecoder::decode($decodedModel, $encoded);
        $iso8601 = $decodedModel->dateTime->format(DateTime::ISO8601);
        $this->assertEqual($encoded['dateTime'], $iso8601);
        $this->assertEqual($model->dateTime, $decodedModel->dateTime);
 //       var_dump($iso8601);
    }

    public function testEncodeDecodeUniversalTimestamp_HistoricalDate_Same()
    {
        $model = new TestJsonDateModel();
        $model->universalTimestamp = UniversalTimestamp::fromStringTimestamp(self::StringTimestampWithMilliseconds);
        $encoded = JsonEncoder::encode($model);
        $this->assertIsA($encoded['universalTimestamp'], 'string');
//        var_dump($encoded);

        $decodedModel = new TestJsonDateModel();
        JsonDecoder::decode($decodedModel, $encoded);
        $iso8601 = $decodedModel->universalTimestamp->asFormattedString(UniversalTimestamp::ISO8601_WITH_MILLISECONDS);
        $this->assertEqual($encoded['universalTimestamp'], $iso8601);
        $this->assertEqual($model->universalTimestamp, $decodedModel->universalTimestamp);
//        var_dump($iso8601);
    }
}
