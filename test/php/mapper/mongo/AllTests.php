<?php
require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllMapperMongoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'mapper/mongo/Date_Test.php');
        $this->addFile(TestPhpPath . 'mapper/mongo/EncoderDecoder_Test.php');
    }

}
