<?php

use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Litipk\Jiffy\UniversalTimestamp;
use PHPUnit\Framework\TestCase;

class TestJsonDateModel
{
    public function __construct()
    {
        $this->dateTime = new DateTime();
        $this->universalTimestamp = UniversalTimestamp::now();
    }

    public $dateTime;

    public $universalTimestamp;
}

class JsonDateMapperTest extends TestCase
{
    const StringTimestamp = "2001-01-01 12:01:01";
    const StringTimestampWithMilliseconds = "2001-01-01 12:01:01.321";
    public function testEncodeDecodeDateTime_HistoricalDate_Same()
    {
        $model = new TestJsonDateModel();
        $model->dateTime = new DateTime(self::StringTimestamp);
        $model->universalTimestamp = UniversalTimestamp::fromStringTimestamp(self::StringTimestamp);
        $encoded = JsonEncoder::encode($model);
        $this->assertIsString($encoded["dateTime"]);
        //        var_dump($encoded);

        $decodedModel = new TestJsonDateModel();
        JsonDecoder::decode($decodedModel, $encoded);
        $rfc3339 = $decodedModel->dateTime->format("c");
        $this->assertEquals($encoded["dateTime"], $rfc3339);
        $this->assertEquals($model->dateTime, $decodedModel->dateTime);
        //       var_dump($rfc3339);
    }

    public function testEncodeDecodeUniversalTimestamp_HistoricalDate_Same()
    {
        $model = new TestJsonDateModel();
        $model->universalTimestamp = UniversalTimestamp::fromStringTimestamp(self::StringTimestampWithMilliseconds);
        $encoded = JsonEncoder::encode($model);
        $this->assertIsString($encoded["universalTimestamp"]);
        //        var_dump($encoded);

        $decodedModel = new TestJsonDateModel();
        JsonDecoder::decode($decodedModel, $encoded);
        $rfc3339 =
            $decodedModel->universalTimestamp->asFormattedString(
                UniversalTimestamp::ISO8601_WITH_MILLISECONDS_WITHOUT_TZ
            ) . $decodedModel->universalTimestamp->asDateTimeInterface()->format("P");
        $this->assertEquals($encoded["universalTimestamp"], $rfc3339);
        $this->assertEquals($model->universalTimestamp, $decodedModel->universalTimestamp);
        //        var_dump($rfc3339);
    }
}
