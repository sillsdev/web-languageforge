<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\mapper\JsonEncoder;
use models\languageforge\semdomtrans\commands\SemDomTransItemCommands;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\mapper\ArrayOf;
use models\languageforge\semdomtrans\SemDomTransStatus;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class SemdomTransItemCommands_Test extends UnitTestCase
{
    public function __construct() {
        parent::__construct();
    }

    public function testSemdomItemCommand_UpdateSemDomItem_AddItemUpdateItem()
    {
        $e = new SemDomMongoTestEnvironment();
        $e->clean();

        $sourceProject = $e->importEnglishProject();
        
        $targetProject = $e->createSemDomProject("en2");
        $targetProject->sourceLanguageProjectId = $sourceProject->id->asString();
        // insert dummy models
        $targetItemModel = new SemDomTransItemModel($sourceProject);

        $targetItemModel->xmlGuid = "asdf123";
        $targetItemModel->key = "1";
        $targetItemModel->name = new SemDomTransTranslatedForm("universe");
        $targetItemModel->description = new SemDomTransTranslatedForm("Universe description");
        $sq = new SemDomTransQuestion("A universe question", "A universe question term");
        $targetItemModel->questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        $targetItemModel->questions[] = $sq;
        
        $data = JsonEncoder::encode($targetItemModel);
        
        $itemId = SemDomTransItemCommands::update($data, $targetProject->id->asString());
        $readItem = new SemDomTransItemModel($targetProject, $itemId);

        $this->assertNotEqual($readItem->key, null);
        $this->assertEqual($readItem->key, "1");         
         
        $this->assertNotEqual($readItem->name, null);
        $this->assertEqual($readItem->name->translation, "universe");
        $this->assertEqual($readItem->name->status, SemDomTransStatus::Draft);

        $this->assertNotEqual($readItem->description->translation, null);
        $this->assertEqual($readItem->description->translation, "Universe description");
        $this->assertEqual($readItem->description->status, SemDomTransStatus::Draft);
        
        $readItem->name = new SemDomTransTranslatedForm("universe-edited");
        $data = JsonEncoder::encode($readItem);
        SemDomTransItemCommands::update($data, $targetProject->id->asString());
        
        $readItemAgain = new SemDomTransItemModel($targetProject, $itemId);

        
        $this->assertNotEqual($readItemAgain->key, null);
        $this->assertEqual($readItemAgain->key, "1");
         
        $this->assertNotEqual($readItemAgain->name, null);
        $this->assertEqual($readItemAgain->name->translation, "universe-edited");
        $this->assertEqual($readItemAgain->name->status, SemDomTransStatus::Draft);
         
        $this->assertNotEqual($readItemAgain->description->translation, null);
        $this->assertEqual($readItemAgain->description->translation, "Universe description");
        $this->assertEqual($readItemAgain->description->status, SemDomTransStatus::Draft);
        
        
    }
}
