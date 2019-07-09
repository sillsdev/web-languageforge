<?php

use Api\Model\Shared\Mapper\MongoDecoder;
use Api\Model\Shared\Mapper\MongoEncoder;
use Litipk\Jiffy\UniversalTimestamp;
use MongoDB\BSON\UTCDateTime;
use PHPUnit\Framework\TestCase;

class TestMongoDateModel
{
    public function __construct()
    {
        $this->dateTime =  new DateTime('2013-08-01 12:01:01.321');
        $this->universalTimestamp = UniversalTimestamp::fromStringTimestamp('2013-08-01 12:01:01.321');
    }

    public $dateTime;

    public $universalTimestamp;
}

class MongoDateMapperTest extends TestCase
{
    public function testEncodeDecodeDateTime_HistoricalDate_Same()
    {
        $model = new TestMongoDateModel();
        $model->dateTime = new DateTime('2001-01-01 12:01:01.000');
        $encoded = MongoEncoder::encode($model);
        $this->assertInstanceOf(UTCDateTime::class, $encoded['dateTime']);

        $decodedModel = new TestMongoDateModel();
        MongoDecoder::decode($decodedModel, $encoded);
        $this->assertEquals($model->dateTime, $decodedModel->dateTime);
//        $iso8601 = $decodedModel->dateTime->asFormattedString(UniversalTimestamp::ISO8601_WITH_MILLISECONDS);
//        var_dump($iso8601);
    }

    public function testEncodeDecodeUniversalTimestamp_HistoricalDate_Same()
    {
        $model = new TestMongoDateModel();
        $model->universalTimestamp = UniversalTimestamp::fromStringTimestamp('2001-01-01 12:01:01.321');
        $encoded = MongoEncoder::encode($model);
        $this->assertInstanceOf(UTCDateTime::class, $encoded['universalTimestamp']);
//        var_dump($encoded);

        $decodedModel = new TestMongoDateModel();
        MongoDecoder::decode($decodedModel, $encoded);
        $this->assertEquals($model->universalTimestamp, $decodedModel->universalTimestamp);
//        $iso8601 = $decodedModel->universalTimestamp->asFormattedString(UniversalTimestamp::ISO8601_WITH_MILLISECONDS);
//        var_dump($iso8601);
    }
}
