<?php

use Api\Model\Languageforge\Semdomtrans\Dto\SemDomTransEditDto;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemListModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransItemModel;
use Api\Model\Languageforge\Semdomtrans\SemDomTransQuestion;
use Api\Model\Languageforge\Semdomtrans\SemDomTransStatus;
use Api\Model\Languageforge\Semdomtrans\SemDomTransTranslatedForm;
use Api\Model\Shared\Mapper\ArrayOf;
use PHPUnit\Framework\TestCase;

class SemDomTransEditDtoTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public function testEncode_SourceProjectFromXmlTargetProjectPreFilled_DtoAsExpected()
    {
        self::$environ = new SemDomMongoTestEnvironment();
        self::$environ->clean();
        self::$environ->getEnglishProjectAndCreateIfNecessary();
        self::$environ->cleanPreviousProject('es');
        $user1Id = self::$environ->createUser('u', 'u', 'u');
        $targetProject = self::$environ->createSemDomProject('es', 'Spanish', $user1Id);
        $result = SemDomTransEditDto::encode($targetProject->id->asString(), null);
        $this->assertNotNull($result['entries']);
        $this->assertEquals('Universe, creation', $result['entries'][0]['name']['source']);
        $this->assertEquals('Cloud', $result['entries'][10]['name']['source']);
        $this->assertEquals('(2) What words refer to the air around the earth?',
            $result['entries'][1]['questions'][1]['question']['source']);
    }

    public function testEncode_SourceProjectAndTargetProjectHaveItems_DtoAsExpected()
    {
        self::$environ = new SemDomMongoTestEnvironment();
        self::$environ->cleanPreviousProject('es');

        /** @noinspection PhpUnusedLocalVariableInspection */
        $sourceProject = self::$environ->getEnglishProjectAndCreateIfNecessary();
        $user1Id = self::$environ->createUser('u', 'u', 'u');
        $targetProject = self::$environ->createSemDomProject('es', 'Spanish', $user1Id);

        /*
        // insert dummy models
        $sourceItemModel = new SemDomTransItemModel($sourceProject);
        $sourceItemModel->key = '1';
        $sourceItemModel->name = new SemDomTransTranslatedForm('universe');
        $sourceItemModel->description = new SemDomTransTranslatedForm('Universe description');
        $sq = new SemDomTransQuestion('A universe question', 'A universe question term');
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
        $targetItemModel->key = '1';
        $targetItemModel->name = new SemDomTransTranslatedForm('wszechswiat');
        $targetItemModel->description = new SemDomTransTranslatedForm('Opis wszechswiata');
        $tq = new SemDomTransQuestion('Pytanie wszechswiata', 'Termin zwiazany z wszechswiatem');
        $targetItemModel->questions = new ArrayOf(function () {
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
        $entries = $result['entries'];
        $this->assertTrue($entries != null);
        $this->assertTrue(count($entries) > 0);

        $firstObject = $entries[0];

        $this->assertNotNull($firstObject['key']);
        $this->assertEquals('1', $firstObject['key']);


        $this->assertNotNull($firstObject['name']);
        $this->assertEquals('Universe, creation', $firstObject['name']['source']);
        $this->assertEquals('wszechswiat', $firstObject['name']['translation']);
        $this->assertEquals(SemDomTransStatus::Draft, $firstObject['name']['status']);

        $this->assertNotNull($firstObject['description']);
        $this->assertEquals('Opis wszechswiata', $firstObject['description']['translation']);
        $this->assertEquals(SemDomTransStatus::Draft, $firstObject['description']['status']);


        $this->assertNotNull($firstObject['questions']);
        $this->assertNotNull($firstObject['questions'][0]);
        $this->assertNotNull($firstObject['questions'][0]['question']);
        $this->assertNotNull($firstObject['questions'][0]['terms']);
        $this->assertEquals('(1) What words refer to everything we can see?',
            $firstObject['questions'][0]['question']['source']);
        $this->assertEquals('Pytanie wszechswiata', $firstObject['questions'][0]['question']['translation']);
        $this->assertEquals('universe, creation, cosmos, heaven and earth, macrocosm, everything that exists',
            $firstObject['questions'][0]['terms']['source']);
        $this->assertEquals('Termin zwiazany z wszechswiatem', $firstObject['questions'][0]['terms']['translation']);

        // this test messes with the English source project
        self::$environ->clean();
        self::$environ->cleanPreviousProject('en');
    }
}
