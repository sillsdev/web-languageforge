<?php


use Api\Model\Languageforge\Lexicon\Sense;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestSenseModel extends UnitTestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $model = new Sense();

        $this->assertIsA($model->partOfSpeech, 'Api\Model\Languageforge\Lexicon\LexiconField');
        $this->assertIsA($model->semanticDomain, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->examples, 'Api\Model\Mapper\ArrayOf');
        $this->assertIsA($model->customFields, 'Api\Model\Mapper\MapOf');
        $this->assertIsA($model->authorInfo, 'Api\Model\Languageforge\Lexicon\AuthorInfo');
        $this->assertIsA($model->definition, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->gloss, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->scientificName, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->anthropologyNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->senseBibliography, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->discourseNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->encyclopedicNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->generalNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->grammarNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->phonologyNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->senseRestrictions, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->semanticsNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->sociolinguisticsNote, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->source, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->senseImportResidue, 'Api\Model\Languageforge\Lexicon\MultiText');
        $this->assertIsA($model->usages, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->reversalEntries, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->senseType, 'Api\Model\Languageforge\Lexicon\LexiconField');
        $this->assertIsA($model->academicDomains, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->sensePublishIn, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->anthropologyCategories, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
        $this->assertIsA($model->status, 'Api\Model\Languageforge\Lexicon\LexiconMultiValueField');
    }

}
