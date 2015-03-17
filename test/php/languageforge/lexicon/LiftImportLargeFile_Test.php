<?php

use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLiftImportInfo
{
    public $points;

    public function __construct()
    {
        $this->points = array();
        $this->add('base');
    }

    public function add($name)
    {
        $mem = memory_get_peak_usage(true);
        $current = memory_get_usage();
        $point = array('name' => $name, 'mem' => $mem, 'current' => $current);
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
        echo $point['name'] . ' pk '. $point['mem'] / 1024 . 'K cur '  . $point['current'] / 1024 . 'K<br/>';
        flush();
    }

}

class TestLiftImport extends UnitTestCase
{
    public function testLiftImportMerge_LargeFile_NoException()
    {
        global $testInfo;
        $testInfo = new TestLiftImportInfo();

        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
//         $liftFilePath = '/home/cambell/src/Forge/TestData/Gilaki/Gilaki.lift';
        $liftFilePath = '/var/www/host/sil/LanguageData/Dailey/Part 2.lift';
        $mergeRule =  LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);
        echo "<pre>";
        echo $importer->getReport()->toFormattedString();
        echo "</pre>";

        $testInfo->add('post merge');

    }

}
