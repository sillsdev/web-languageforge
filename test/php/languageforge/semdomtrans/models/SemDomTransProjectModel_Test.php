<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\semdomtrans\dto\SemDomTransEditDto;
use models\languageforge\semdomtrans\SemDomTransItemListModel;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\mapper\ArrayOf;
use models\languageforge\semdomtrans\SemDomTransStatus;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
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
        $project = $e->createSemDomProject('es', $user1Id);

    }


    public function testImportFromFile_nonEnglishProject_importsOk() {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $e->getEnglishProjectAndCreateIfNecessary();
        $project = $e->createSemDomProject('es', $user1Id);

        $listModel = new SemDomTransItemListModel($project);
        $listModel->read();
        $xmlFilePath  = TestPath . "languageforge/semdomtrans/testFiles/LocalizedLists-es.xml";
        $project->importFromFile($xmlFilePath);
        $listModel->read();
        $this->assertEqual($listModel->count, 1792);
    }
}
