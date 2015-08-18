<?php

use Api\Library\Shared\LanguageData;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestLanguageData extends UnitTestCase
{
    public function testLanguageData_DataExists()
    {
        $languages = new LanguageData();

        $this->assertTrue($languages->count() >= 7725);
        $this->assertEqual($languages['eng']->name, "English");
        $this->assertEqual($languages['en']->name, "English");
        $this->assertEqual($languages['mri']->name, "Maori");
        $this->assertEqual($languages['mi']->name, "Maori");
        $this->assertEqual($languages['qaa']->name, "Unlisted Language");
    }

}
