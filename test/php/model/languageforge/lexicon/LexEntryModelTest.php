<?php

use Api\Model\Languageforge\Lexicon\LexAuthorInfo;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexMultiText;
use Api\Model\Languageforge\Lexicon\LexMultiValue;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;
//use PHPUnit\Framework\TestCase;

class LexEntryModelTest extends PHPUnit_Framework_TestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $environ = new MongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $entry = new LexEntryModel($project);

        $this->assertInstanceOf(ArrayOf::class, $entry->senses);
        $this->assertInstanceOf(MapOf::class, $entry->customFields);
        $this->assertInstanceOf(LexAuthorInfo::class, $entry->authorInfo);
        $this->assertInstanceOf(LexMultiText::class, $entry->lexeme);
        $this->assertInstanceOf(LexMultiText::class, $entry->pronunciation);
        $this->assertInstanceOf(LexMultiText::class, $entry->cvPattern);
        $this->assertInstanceOf(LexMultiText::class, $entry->citationForm);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymology);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologyGloss);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologyComment);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologySource);
        $this->assertInstanceOf(LexMultiText::class, $entry->note);
        $this->assertInstanceOf(LexMultiText::class, $entry->literalMeaning);
        $this->assertInstanceOf(LexMultiText::class, $entry->entryBibliography);
        $this->assertInstanceOf(LexMultiText::class, $entry->entryRestrictions);
        $this->assertInstanceOf(LexMultiText::class, $entry->summaryDefinition);
        // Removed import residue. Its no longer a field we import CP 2014-10
        // $this->assertInstanceOf(LexMultiText::class, $entry->entryImportResidue);
        $this->assertInstanceOf(LexMultiText::class, $entry->tone);
        $this->assertInstanceOf(LexMultiValue::class, $entry->environments);
        $this->assertInstanceOf(LexValue::class, $entry->location);
    }
}
