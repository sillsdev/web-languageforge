<?php

use Api\Model\Languageforge\Lexicon\LexAuthorInfo;
use Api\Model\Languageforge\Lexicon\LexMultiText;
use Api\Model\Languageforge\Lexicon\LexMultiValue;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;
//use PHPUnit\Framework\TestCase;

class LexSenseModelTest extends PHPUnit_Framework_TestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $sense = new LexSense();

        $this->assertInstanceOf(LexValue::class, $sense->partOfSpeech);
        $this->assertInstanceOf(LexMultiValue::class, $sense->semanticDomain);
        $this->assertInstanceOf(ArrayOf::class, $sense->examples);
        $this->assertInstanceOf(MapOf::class, $sense->customFields);
        $this->assertInstanceOf(LexAuthorInfo::class, $sense->authorInfo);
        $this->assertInstanceOf(LexMultiText::class, $sense->definition);
        $this->assertInstanceOf(LexMultiText::class, $sense->gloss);
        $this->assertInstanceOf(LexMultiText::class, $sense->scientificName);
        $this->assertInstanceOf(LexMultiText::class, $sense->anthropologyNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->senseBibliography);
        $this->assertInstanceOf(LexMultiText::class, $sense->discourseNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->encyclopedicNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->generalNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->grammarNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->phonologyNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->senseRestrictions);
        $this->assertInstanceOf(LexMultiText::class, $sense->semanticsNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->sociolinguisticsNote);
        $this->assertInstanceOf(LexMultiText::class, $sense->source);
        $this->assertInstanceOf(LexMultiText::class, $sense->senseImportResidue);
        $this->assertInstanceOf(LexMultiValue::class, $sense->usages);
        $this->assertInstanceOf(LexMultiValue::class, $sense->reversalEntries);
        $this->assertInstanceOf(LexValue::class, $sense->senseType);
        $this->assertInstanceOf(LexMultiValue::class, $sense->academicDomains);
        $this->assertInstanceOf(LexMultiValue::class, $sense->anthropologyCategories);
        $this->assertInstanceOf(LexMultiValue::class, $sense->status);
    }
}
