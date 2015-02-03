<?php

use libraries\shared\Website;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestWebsite extends UnitTestCase
{
    public function testGet_Works()
    {
        $website = Website::get('scriptureforge.org');
        $this->assertEqual($website->domain, 'scriptureforge.org');
        $this->assertEqual($website->base, 'scriptureforge');
        $this->assertEqual($website->theme, 'default');

        $website = Website::get('randomdomain.com');
        $this->assertNull($website);
    }

    public function testGetRedirect_Works()
    {
        $redirect = Website::getRedirect('randomdomain.com');
        $this->assertEqual($redirect, '');

        $redirect = Website::getRedirect('scriptureforge.org');
        $this->assertEqual($redirect, '');

        $redirect = Website::getRedirect('www.scriptureforge.org');
        $this->assertEqual($redirect, 'https://scriptureforge.org');

        $redirect = Website::getRedirect('jamaicanpsalms.org');
        $this->assertEqual($redirect, 'https://jamaicanpsalms.com');
    }

    /* -- currently not in use so commented out cjh 2014-06
	function testGetProjectThemeNamesForSite_Works()
	{
		$themeNames = Website::getProjectThemeNamesForSite('scriptureforge');
		$this->assertEqual($themeNames[0], 'default');
		$this->assertEqual($themeNames[1], 'jamaicanpsalms');

		$themeNames = Website::getProjectThemeNamesForSite('languageforge');
		$this->assertEqual($themeNames[0], 'default');
	}
	*/

}
