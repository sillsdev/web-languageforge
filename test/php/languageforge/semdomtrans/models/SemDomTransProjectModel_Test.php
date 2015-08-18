<?php

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Languageforge\Semdomtrans\Dto\SemDomTransEditDto;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestSemDomTransProjectModel extends UnitTestCase
{

    public function __construct() {
    }



    public function testPreFillFromSourceLanguage_englishProjectExists_newProjectPrefilled()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $e->getEnglishProjectAndCreateIfNecessary();
        $project = $e->createSemDomProject('es', "Spanish", $user1Id);

    }


    public function testImportFromFile_nonEnglishProject_importsOk() {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $e->getEnglishProjectAndCreateIfNecessary();
        $project = $e->createSemDomProject('es', "Spanish", $user1Id);

        $listModel = new SemDomTransItemListModel($project);
        $listModel->read();
        $xmlFilePath  = TestPath . "languageforge/semdomtrans/testFiles/LocalizedLists-es.xml";
        $project->importFromFile($xmlFilePath);
        $listModel->read();
        $this->assertEqual($listModel->count, 1792);
    }
}
