<?php

use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransProjectCommands;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\SemDomTransProjectModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransItemCommands;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class SemdomTransItemCommands_Test extends UnitTestCase
{
    public function __construct() {
    }

    public function testSemdomItemCommand_UpdateSemDomItem_AddItemUpdateItem()
    {
        $e = new SemDomMongoTestEnvironment();
        $lang = 'en2';
        $languageName = "English";
        $e->cleanPreviousProject($lang);

        $e->getEnglishProjectAndCreateIfNecessary();
        $user1Id = $e->createUser('u', 'u', 'u');
        $targetProject = $e->createSemDomProject($lang, $languageName, $user1Id);

        // insert dummy models
        $targetItemModel = new SemDomTransItemModel($targetProject);

        $targetItemModel->xmlGuid = "asdf123";
        $targetItemModel->key = "1";
        $targetItemModel->name = new SemDomTransTranslatedForm("universe");
        $targetItemModel->description = new SemDomTransTranslatedForm("Universe description");
        $sq = new SemDomTransQuestion("A universe question", "A universe question term");
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
