<?php
require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllMapperMongoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'mapper/mongo/Date_Test.php');
        $this->addFile(TestPath . 'mapper/mongo/EncoderDecoder_Test.php');
    }

}
