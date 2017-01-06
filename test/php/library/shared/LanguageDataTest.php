<?php

use Api\Library\Shared\LanguageData;
//use PHPUnit\Framework\TestCase;

class LanguageDataTest extends PHPUnit_Framework_TestCase
{
    public function testLanguageData_DataExists()
    {
        $languages = new LanguageData();

        $this->assertTrue($languages->count() >= 7707);
        $this->assertEquals('English', $languages['eng']->name);
        $this->assertEquals('English', $languages['en']->name);
        $this->assertEquals('Maori', $languages['mri']->name);
        $this->assertEquals('Maori', $languages['mi']->name);
        $this->assertEquals('Unlisted Language', $languages['qaa']->name);
    }

    // From SIL.WritingSystems.Tests/LanguageLookupTests.cs
    //
    // This is a result of finding that some of the alternative names, in Nov 2016, were *not* marked as pejorative but actually were.
    // These may be fixed in the Ethnologue over time, but it was requested that we just remove all alternative names for now.
    public function testLanguageData_LanguageIsInEthiopia_ShowOnlyOfficialNames()
    {
        $languages = new LanguageData();
        $this->assertArrayHasKey('en', $languages);
        $this->assertNotEmpty($languages['en']->altNames);

        $this->assertEquals('Wolaytta', $languages['wal']->name);
        $this->assertEmpty($languages['wal']->altNames);
    }

    // We have been asked to temporarily suppress these three codes for Ethiopia, until the Ethnologue is changed.
    public function testLanguageData_LanguageIsOromo_DoNotShowRelatedLanguages()
    {
        $languages = new LanguageData();
        $this->assertArrayHasKey('en', $languages);
        $this->assertNotEmpty($languages['en']->altNames);

        $this->assertEquals('Oromo', $languages['om']->name);
        $this->assertEmpty($languages['om']->altNames);
        $this->assertArrayNotHasKey('gax', $languages);
        $this->assertArrayNotHasKey('gaz', $languages);
        $this->assertArrayNotHasKey('hae', $languages);
    }
}
