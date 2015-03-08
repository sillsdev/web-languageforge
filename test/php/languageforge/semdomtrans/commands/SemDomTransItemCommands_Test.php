<?php

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\SemDomTransProjectModel;
use models\mapper\JsonEncoder;
use models\languageforge\semdomtrans\commands\SemDomTransItemCommands;
use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\semdomtrans\SemDomTransQuestion;
use models\mapper\ArrayOf;

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
        
        $projectModel = $e->createSemDomProject("en");
        // insert dummy models
        $sourceItemModel = new SemDomTransItemModel($projectModel);

        $sourceItemModel->xmlGuid = "asdf123";
        $sourceItemModel->key = "1";
        $sourceItemModel->name = new SemDomTransTranslatedForm("universe");
        $sourceItemModel->description = new SemDomTransTranslatedForm("Universe description");
        $sq = new SemDomTransQuestion("A universe question", "A universe question term");
        $sourceItemModel->questions = new ArrayOf(function ($data) {
            return new SemDomTransQuestion();
        });
        $sourceItemModel->questions[] = $sq;
        
        $data = JsonEncoder::encode($sourceItemModel);
        
        $itemId = SemDomTransItemCommands::update($data, $projectModel->id->asString());      
        $readItem = new SemDomTransItemModel($projectModel);
        $readItem->read($itemId);
        
        $this->assertNotEqual($readItem->key, null);
        $this->assertEqual($readItem->key, "1");         
         
        $this->assertNotEqual($readItem->name, null);
        $this->assertEqual($readItem->name->translation, "universe");
        $this->assertEqual($readItem->name->status, 0);
         
        $this->assertNotEqual($readItem->description->translation, null);
        $this->assertEqual($readItem->description->translation, "Universe description");
        $this->assertEqual($readItem->description->translation, 0);
        
        $sourceItemModel->name = new SemDomTransTranslatedForm("universe-edited");
        $data = JsonEncoder::encode($sourceItemModel);
        SemDomTransItemCommands::update($data, $projectModel->id->asString());
        
        $readItem = new SemDomTransItemModel($projectModel);
        $readItem->read($itemId);
        
        
        $this->assertNotEqual($readItem->key, null);
        $this->assertEqual($readItem->key, "1");
         
        $this->assertNotEqual($readItem->name, null);
        $this->assertEqual($readItem->name->translation, "universe-edited");
        $this->assertEqual($readItem->name->status, 0);
         
        $this->assertNotEqual($readItem->description->translation, null);
        $this->assertEqual($readItem->description->translation, "Universe description");
        $this->assertEqual($readItem->description->translation, 0);
        
        
    }
}
