<?php

use Api\Library\Shared\LanguageData;
use PHPUnit\Framework\TestCase;

class LanguageDataTest extends TestCase
{
    public function testLanguageData_DataExists()
    {
        $languages = new LanguageData();

        $this->assertTrue($languages->count() >= 7725);
        $this->assertEquals('English', $languages['eng']->name);
        $this->assertEquals('English', $languages['en']->name);
        $this->assertEquals('Maori', $languages['mri']->name);
        $this->assertEquals('Maori', $languages['mi']->name);
        $this->assertEquals('Unlisted Language', $languages['qaa']->name);
    }
}
