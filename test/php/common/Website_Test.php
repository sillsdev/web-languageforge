<?php

use libraries\shared\Website;


require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');


class TestWebsite extends UnitTestCase {

	function testGetHostName_Works() {
		$domainName = 'www.scriptureforge.org';
		$result = Website::getHostName($domainName);
		$this->assertEqual($result, 'www.scriptureforge.org');

		$domainName = 'dev.languageforge.org';
		$result = Website::getHostName($domainName);
		$this->assertEqual($result, 'dev.languageforge.org');

		$domainName = 'jamaicanpsalms.scriptureforge.org';
		$result = Website::getHostName($domainName);
		$this->assertEqual($result, 'scriptureforge.org');

		$domainName = 'jamaicanpsalms.scriptureforge.local';
		$result = Website::getHostName($domainName);
		$this->assertEqual($result, 'scriptureforge.local');

		$domainName = 'jamaicanpsalms.dev.scriptureforge.org';
		$result = Website::getHostName($domainName);
		$this->assertEqual($result, 'dev.scriptureforge.org');
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
	
	function testGetProjectThemeNameFromDomain_Works() {
		$domainName = 'www.languageforge.org';
		$result = Website::getProjectThemeNameFromDomain($domainName);
		$this->assertEqual($result, 'default');

		$domainName = 'dev.languageforge.org';
		$result = Website::getProjectThemeNameFromDomain($domainName);
		$this->assertEqual($result, 'default');

		$domainName = 'jamaicanpsalms.scriptureforge.org';
		$result = Website::getProjectThemeNameFromDomain($domainName);
		$this->assertEqual($result, 'jamaicanpsalms');

		$domainName = 'languageforge.org';
		$result = Website::getProjectThemeNameFromDomain($domainName);
		$this->assertEqual($result, 'default');
	}
	
}

?>
