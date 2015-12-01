<?php
require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllMapperJsonTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'mapper/json/Date_Test.php');
        $this->addFile(TestPhpPath . 'mapper/json/EncoderDecoder_Test.php');
    }

}
