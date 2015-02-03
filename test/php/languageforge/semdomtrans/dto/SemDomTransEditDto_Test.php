<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\semdomtrans\dto\SemDomTransEditDto;
use models\languageforge\semdomtrans\SemDomTransItemListModel;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\mapper\ArrayOf;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestSemDomTransEditDto extends UnitTestCase
{

    public function __construct() {
    }


    public function testEncode_SourceProjectAndTargetProjectHaveItems_DtoAsExpected()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        
        // create a new semdom project (source)
        $sourceProject = new SemDomTransProjectModel();
        $sourceProject->languageIsoCode = "en";
        $sourceProject->semdomVersion = "1";
        $sourceProject->projectCode = "semdonen";
        $sourceProject->write();
        
        // create a new semdom project (target)
        $targetProject = new SemDomTransProjectModel();
        $targetProject->languageIsoCode = "pl";
        $targetProject->semdomVersion = "1";
        $targetProject->projectCode = "semdonpl";
        $targetProject->sourceLanguageProjectId = $sourceProject->id->asString();
        $targetProject->write();
        
        
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
        
        $targetItemModel = new SemDomTransItemModel($targetProject);
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
        $prId = $targetProject->id;
        $loadTargetProject = new SemDomTransProjectModel($prId->asString());
        $loadSourceProject = new SemDomTransProjectModel($loadTargetProject->sourceLanguageProjectId);
        $result = SemDomTransEditDto::encode($prId->asString(), null);
        
        print_r($result);
        // check dto returns expected results
         /*$items = $result["items"];
         $this->assertTrue($items != null); 
         $this->assertTrue(count($items) > 0);
         
         $firstObject = $items[0];
         
         $this->assertNotEqual($firstObject["key"], null);
         $this->assertEqual($firstObject["key"], "1");
         
         
         $this->assertNotEqual($firstObject["name"], null);
         $this->assertEqual($firstObject["name"]["source"], "universe");
         $this->assertEqual($firstObject["name"]["translation"], "wszechswiat");
         $this->assertEqual($firstObject["name"]["status"], 0);
         
         $this->assertNotEqual($firstObject["description"], null);
         $this->assertEqual($firstObject["description"]["source"], "Universe description");
         $this->assertEqual($firstObject["description"]["translation"], "Opis wszechswiata");
         $this->assertEqual($firstObject["description"]["status"], 0);
         
         
         $this->assertNotEqual($firstObject["questions"], null);
         $this->assertNotEqual($firstObject["questions"][0], null);
         $this->assertNotEqual($firstObject["questions"][0]["question"], null);
         $this->assertNotEqual($firstObject["questions"][0]["terms"], null);
         $this->assertEqual($firstObject["questions"][0]["question"]["source"], "A universe question");
         $this->assertEqual($firstObject["questions"][0]["question"]["translation"], "");
         $this->assertEqual($firstObject["questions"][0]["terms"]["source"], "");
         $this->assertEqual($firstObject["questions"][0]["terms"]["translation"], "Termin zwiazany z wszechswiatem");
         */
         // clean-up
         // TODO: create a custom semdomtrans mongo environment
         $targetProject->remove();
         $sourceProject->remove();
    }
}
