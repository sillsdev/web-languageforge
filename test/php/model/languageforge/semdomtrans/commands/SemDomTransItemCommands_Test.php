<?php

use Api\Model\Languageforge\Semdomtrans\Command\SemDomTransItemCommands;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Shared\Mapper\JsonEncoder;
use PHPUnit\Framework\TestCase;

class SemDomTransItemCommands_Test extends TestCase
{
    public function testSemDomItemCommand_UpdateSemDomItem_AddItemUpdateItem()
    {
        $environ = new SemDomMongoTestEnvironment();
        $lang = 'en2';
        $languageName = 'English';
        $environ->cleanPreviousProject($lang);

        $environ->getEnglishProjectAndCreateIfNecessary();
        $user1Id = $environ->createUser('u', 'u', 'u');
        $targetProject = $environ->createSemDomProject($lang, $languageName, $user1Id);

        // insert dummy models
        $targetItemModel = new SemDomTransItemModel($targetProject);

        $targetItemModel->xmlGuid = 'asdf123';
        $targetItemModel->key = '1';
        $targetItemModel->name = new SemDomTransTranslatedForm('universe');
        $targetItemModel->description = new SemDomTransTranslatedForm('Universe description');
        $sq = new SemDomTransQuestion('A universe question', 'A universe question term');
        $targetItemModel->questions[] = $sq;
        
        $data = JsonEncoder::encode($targetItemModel);
        
        $itemId = SemDomTransItemCommands::update($data, $targetProject->id->asString());
        $readItem = new SemDomTransItemModel($targetProject, $itemId);

        $this->assertNotNull($readItem->key);
        $this->assertEquals('1', $readItem->key);
         
        $this->assertNotNull($readItem->name);
        $this->assertEquals('universe', $readItem->name->translation);
        $this->assertEquals(SemDomTransStatus::Draft, $readItem->name->status);

        $this->assertNotNull($readItem->description->translation);
        $this->assertEquals('Universe description', $readItem->description->translation);
        $this->assertEquals(SemDomTransStatus::Draft, $readItem->description->status);
        
        $readItem->name = new SemDomTransTranslatedForm('universe-edited');
        $data = JsonEncoder::encode($readItem);
        SemDomTransItemCommands::update($data, $targetProject->id->asString());
        
        $readItemAgain = new SemDomTransItemModel($targetProject, $itemId);

        $this->assertNotNull($readItemAgain->key);
        $this->assertEquals('1', $readItemAgain->key);
         
        $this->assertNotNull($readItemAgain->name);
        $this->assertEquals('universe-edited', $readItemAgain->name->translation);
        $this->assertEquals(SemDomTransStatus::Draft, $readItemAgain->name->status);
         
        $this->assertNotNull($readItemAgain->description->translation);
        $this->assertEquals('Universe description', $readItemAgain->description->translation);
        $this->assertEquals(SemDomTransStatus::Draft, $readItemAgain->description->status);
    }
}
