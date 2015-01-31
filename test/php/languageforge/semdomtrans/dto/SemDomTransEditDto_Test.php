<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\semdomtrans\dto\SemDomTransEditDto;
use models\languageforge\semdomtrans\SemDomTransItemListModel;

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
        $sourceItemModel->write();
        
        $targetItemModel = new SemDomTransItemModel($targetProject);
        $targetItemModel->key = "1";
        $targetItemModel->name = new SemDomTransTranslatedForm("wszechswiat");
        $targetItemModel->write();           
        
        // call dto
        $prId = $targetProject->id;
        $loadTargetProject = new SemDomTransProjectModel($prId->asString());
        $loadSourceProject = new SemDomTransProjectModel($loadTargetProject->sourceLanguageProjectId);
        $result = SemDomTransEditDto::encode($prId->asString(), null);
        
        // check dto returns expected results
         $items = $result["items"];
         $this->assertTrue($items != null); 
         $this->assertTrue(count($items) > 0);
         $firstObject = $items[0];
         $this->assertTrue($firstObject["key"] != null);
         $this->assertTrue($firstObject["key"] == "1");
         $this->assertTrue($firstObject["name"] != null);
         $this->assertTrue($firstObject["name"]["source"] == "universe");
         $this->assertTrue($firstObject["name"]["translation"] == "wszechswiat");
         $this->assertTrue($firstObject["name"]["status"] == 0);
         
         // clean-up
         // TODO: create a custom semdomtrans mongo environment
         $targetProject->remove();
         $sourceProject->remove();
    }
}
