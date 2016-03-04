<?php

use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Languageforge\Semdomtrans\Dto\SemDomTransEditDto;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransItemCommands;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestSemDomTransEditDto extends UnitTestCase
{

    public function __construct() {
        $e = new SemDomMongoTestEnvironment();
        $e->clean();
    }


    public function testEncode_SourceProjectFromXmlTargetProjectPreFilled_DtoAsExpected()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->clean();
        $e->getEnglishProjectAndCreateIfNecessary();
        $e->cleanPreviousProject('es');
        $user1Id = $e->createUser('u', 'u', 'u');
        $targetProject = $e->createSemDomProject('es', "Spanish", $user1Id);
        $result = SemDomTransEditDto::encode($targetProject->id->asString(), null);
        $this->assertNotEqual($result["entries"], null);
        $this->assertEqual($result["entries"][0]["name"]["source"], "Universe, creation");
        $this->assertEqual($result["entries"][10]["name"]["source"], "Cloud");
        $this->assertEqual($result["entries"][1]["questions"][1]["question"]["source"], "(2) What words refer to the air around the earth?");
    }


    public function testEncode_SourceProjectAndTargetProjectHaveItems_DtoAsExpected()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->cleanPreviousProject('es');

        $sourceProject = $e->getEnglishProjectAndCreateIfNecessary();
        $user1Id = $e->createUser('u', 'u', 'u');
        $targetProject = $e->createSemDomProject('es', "Spanish", $user1Id);


        /*
        // insert dummy models
        $sourceItemModel = new SemDomTransItemModel($sourceProject);
        $sourceItemModel->key = "1";
        $sourceItemModel->name = new SemDomTransTranslatedForm("universe");
        $sourceItemModel->description = new SemDomTransTranslatedForm("Universe description");
        $sq = new SemDomTransQuestion("A universe question", "A universe question term");
        $sourceItemModel->questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        $sourceItemModel->questions[] = $sq;
        $sourceItemModel->write();
        */
        $targetItemsModel = new SemDomTransItemListModel($targetProject);
        $targetItemsModel->read();
        $targetItems = $targetItemsModel->entries;
        
        $targetItemModel = new SemDomTransItemModel($targetProject);
        $targetItemModel->readByProperty('xmlGuid', $targetItems[0]['xmlGuid']);
        $targetItemModel->key = "1";
        $targetItemModel->name = new SemDomTransTranslatedForm("wszechswiat");
        $targetItemModel->description = new SemDomTransTranslatedForm("Opis wszechswiata");
        $tq = new SemDomTransQuestion("Pytanie wszechswiata", "Termin zwiazany z wszechswiatem");
        $targetItemModel->questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        $targetItemModel->questions[] = $tq;
        $targetItemModel->write();
        
        // call dto
        //$loadTargetProject = new SemDomTransProjectModel($prId->asString());
        //$loadSourceProject = new SemDomTransProjectModel($loadTargetProject->sourceLanguageProjectId);

        $prId = $targetProject->id;
        $result = SemDomTransEditDto::encode($prId->asString(), null);

        // print_r($result);
        // check dto returns expected results
         $entries = $result["entries"];
         $this->assertTrue($entries != null); 
         $this->assertTrue(count($entries) > 0);

         $firstObject = $entries[0];

        $this->assertNotEqual($firstObject["key"], null);
        $this->assertEqual($firstObject["key"], "1");


        $this->assertNotEqual($firstObject["name"], null);
        $this->assertEqual($firstObject["name"]["source"], "Universe, creation");
        $this->assertEqual($firstObject["name"]["translation"], "wszechswiat");
        $this->assertEqual($firstObject["name"]["status"], SemDomTransStatus::Draft);

        $this->assertNotEqual($firstObject["description"], null);
        $this->assertEqual($firstObject["description"]["translation"], "Opis wszechswiata");
        $this->assertEqual($firstObject["description"]["status"], SemDomTransStatus::Draft);


        $this->assertNotEqual($firstObject["questions"], null);
        $this->assertNotEqual($firstObject["questions"][0], null);
        $this->assertNotEqual($firstObject["questions"][0]["question"], null);
        $this->assertNotEqual($firstObject["questions"][0]["terms"], null);
        $this->assertEqual($firstObject["questions"][0]["question"]["source"], "(1) What words refer to everything we can see?");
        $this->assertEqual($firstObject["questions"][0]["question"]["translation"], "Pytanie wszechswiata");
        $this->assertEqual($firstObject["questions"][0]["terms"]["source"], "universe, creation, cosmos, heaven and earth, macrocosm, everything that exists");
        $this->assertEqual($firstObject["questions"][0]["terms"]["translation"], "Termin zwiazany z wszechswiatem");

        // this test messes with the English source project
        $e->clean();
        $e->cleanPreviousProject('en');
    }
}
