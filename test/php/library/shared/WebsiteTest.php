<?php

use Api\Library\Shared\Website;
//use PHPUnit\Framework\TestCase;

class WebsiteTest extends PHPUnit_Framework_TestCase
{
    public function testGet_Works()
    {
        $website = Website::get('scriptureforge.org');
        $this->assertEquals('scriptureforge.org', $website->domain);
        $this->assertEquals('scriptureforge', $website->base);
        $this->assertEquals('default', $website->theme);

        $website = Website::get('randomdomain.com');
        $this->assertNull($website);
    }

    public function testGetRedirect_Works()
    {
        $redirect = Website::getRedirect('randomdomain.com');
        $this->assertEquals('', $redirect);

        $redirect = Website::getRedirect('scriptureforge.org');
        $this->assertEquals('', $redirect);

        $redirect = Website::getRedirect('www.scriptureforge.org');
        $this->assertEquals('https://scriptureforge.org', $redirect);

        $redirect = Website::getRedirect('jamaicanpsalms.org');
        $this->assertEquals('https://jamaicanpsalms.scriptureforge.org', $redirect);
    }

    /* -- currently not in use so commented out cjh 2014-06
    function testGetProjectThemeNamesForSite_Works()
    {
        $themeNames = Website::getProjectThemeNamesForSite('scriptureforge');
        $this->assertEquals('default', $themeNames[0]);
        $this->assertEquals('jamaicanpsalms', $themeNames[1]);

        $themeNames = Website::getProjectThemeNamesForSite('languageforge');
        $this->assertEquals('default', $themeNames[0]);
    }
    */
}
