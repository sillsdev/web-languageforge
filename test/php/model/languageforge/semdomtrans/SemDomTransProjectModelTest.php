<?php

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use PHPUnit\Framework\TestCase;

class SemDomTransProjectModelTest extends TestCase
{
    public function testPreFillFromSourceLanguage_englishProjectExists_newProjectPrefilled()
    {
        $environ = new SemDomMongoTestEnvironment();
        $environ->cleanPreviousProject('es');
        $user1Id = $environ->createUser('u', 'u', 'u');
        $environ->getEnglishProjectAndCreateIfNecessary();
        $environ->createSemDomProject('es', 'Spanish', $user1Id);
    }

    public function testImportFromFile_nonEnglishProject_importsOk() {
        $environ = new SemDomMongoTestEnvironment();
        $environ->cleanPreviousProject('es');
        $user1Id = $environ->createUser('u', 'u', 'u');
        $environ->getEnglishProjectAndCreateIfNecessary();
        $project = $environ->createSemDomProject('es', 'Spanish', $user1Id);

        $listModel = new SemDomTransItemListModel($project);
        $listModel->read();
        $xmlFilePath  = __DIR__ . '/testFiles/LocalizedLists-es.xml';
        $project->importFromFile($xmlFilePath);
        $listModel->read();
        $this->assertEquals(1792, $listModel->count);
    }
}
