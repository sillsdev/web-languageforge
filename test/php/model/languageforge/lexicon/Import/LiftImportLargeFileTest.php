<?php

use Api\Model\Languageforge\Lexicon\Import\LiftImport;
use Api\Model\Languageforge\Lexicon\Import\LiftMergeRule;
use PHPUnit\Framework\TestCase;

class TestLiftImportInfo
{
    public function __construct()
    {
        $this->points = [];
        $this->add("base");
    }

    public $points;

    public function add($name)
    {
        $mem = memory_get_peak_usage(true);
        $current = memory_get_usage();
        $point = ["name" => $name, "mem" => $mem, "current" => $current];
        $this->points[] = $point;
        $this->displayPoint($point);
    }

    public function display()
    {
        foreach ($this->points as $point) {
            $this->displayPoint($point);
        }
    }

    public function displayPoint($point)
    {
        echo $point["name"] . " pk " . $point["mem"] / 1024 . "K cur " . $point["current"] / 1024 . "K<br/>";
    }
}

/**
 * This test is intentionally EXCLUDED from PHP unit tests.
 * It is intended to be run manually (explicitly)
 * @group explicit
 */
class LiftImportLargeFileTest extends TestCase
{
    public function testLiftImportMerge_LargeFile_NoException()
    {
        global $testInfo;
        $testInfo = new TestLiftImportInfo();

        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        //         $liftFilePath = '/home/cambell/src/Forge/TestData/Gilaki/Gilaki.lift';
        //        $liftFilePath = '/home/cambell/src/Forge/TestData/Webster/Webster.lift';
        //        $liftFilePath = '/home/ira/TestData/test-langprojih-flex/test-langprojih-flex.lift';
        $liftFilePath = "/home/ira/TestData/test-rwr-flex/test-rwr-flex.lift";
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $time1 = new DateTime();
        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);
        $time2 = new DateTime();
        $elapsed = $time2->diff($time1);
        echo $elapsed->format("%I:%S") . "<br/>";

        $testInfo->add("post merge");
    }
}
