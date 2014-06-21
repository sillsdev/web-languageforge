<?php

use libraries\shared\Website;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class TestWebsite extends UnitTestCase {

	function testGet_Works() {
		
	}
	
	function testGetRedirect_Works() {
		
	}
	
	function testGetSiteName_Works() {
		$domainName = 'www.languageforge.org';
		$result = Website::getSiteName($domainName);
		$this->assertEqual($result, 'languageforge');

		$domainName = 'languageforge.org';
		$result = Website::getSiteName($domainName);
		$this->assertEqual($result, 'languageforge');

		$domainName = 'languageforge.local';
		$result = Website::getSiteName($domainName);
		$this->assertEqual($result, 'languageforge');

		$domainName = 'jamaicanpsalms.dev.scriptureforge.org';
		$result = Website::getSiteName($domainName);
		$this->assertEqual($result, 'scriptureforge');
	}
	
	/* -- currently not in use so commented out cjh 2014-06
	function testGetProjectThemeNamesForSite_Works() {
		$themeNames = Website::getProjectThemeNamesForSite('scriptureforge');
		$this->assertEqual($themeNames[0], 'default');
		$this->assertEqual($themeNames[1], 'jamaicanpsalms');
		
		$themeNames = Website::getProjectThemeNamesForSite('languageforge');
		$this->assertEqual($themeNames[0], 'default');
	}
	*/
	
}

?>
