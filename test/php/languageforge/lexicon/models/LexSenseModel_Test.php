<?php


use Api\Model\Languageforge\Lexicon\LexSense;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexSenseModel extends UnitTestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $model = new LexSense();

        $this->assertIsA($model->partOfSpeech, 'Api\Model\Languageforge\Lexicon\LexValue');
        $this->assertIsA($model->semanticDomain, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->examples, 'Api\Model\Mapper\ArrayOf');
        $this->assertIsA($model->customFields, 'Api\Model\Mapper\MapOf');
        $this->assertIsA($model->authorInfo, 'Api\Model\Languageforge\Lexicon\LexAuthorInfo');
        $this->assertIsA($model->definition, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->gloss, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->scientificName, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->anthropologyNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->senseBibliography, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->discourseNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->encyclopedicNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->generalNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->grammarNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->phonologyNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->senseRestrictions, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->semanticsNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->sociolinguisticsNote, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->source, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->senseImportResidue, 'Api\Model\Languageforge\Lexicon\LexMultiText');
        $this->assertIsA($model->usages, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->reversalEntries, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->senseType, 'Api\Model\Languageforge\Lexicon\LexValue');
        $this->assertIsA($model->academicDomains, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->sensePublishIn, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->anthropologyCategories, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
        $this->assertIsA($model->status, 'Api\Model\Languageforge\Lexicon\LexMultiValue');
    }

}
