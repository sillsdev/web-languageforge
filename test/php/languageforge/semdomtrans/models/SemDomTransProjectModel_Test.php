<?php

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestSemDomTransProjectModel extends UnitTestCase
{
    public function testPreFillFromSourceLanguage_englishProjectExists_newProjectPrefilled()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $e->getEnglishProjectAndCreateIfNecessary();
        $e->createSemDomProject('es', "Spanish", $user1Id);
    }

    public function testImportFromFile_nonEnglishProject_importsOk() {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $e->getEnglishProjectAndCreateIfNecessary();
        $project = $e->createSemDomProject('es', "Spanish", $user1Id);

        $listModel = new SemDomTransItemListModel($project);
        $listModel->read();
        $xmlFilePath  = TestPhpPath . "languageforge/semdomtrans/testFiles/LocalizedLists-es.xml";
        $project->importFromFile($xmlFilePath);
        $listModel->read();
        $this->assertEqual($listModel->count, 1792);
    }
}
