<?php

use Api\Library\Shared\Website;
use PHPUnit\Framework\TestCase;

class WebsiteTest extends TestCase
{
    public function testGet_Works()
    {
        $website = Website::get('languageforge.org');
        $this->assertEquals('languageforge.org', $website->domain);
        $this->assertEquals('languageforge', $website->base);
        $this->assertEquals('default', $website->theme);

        $website = Website::get('randomdomain.com');
        $this->assertNull($website);
    }

    public function testGetRedirect_Works()
    {
        $redirect = Website::getRedirect('randomdomain.com');
        $this->assertEquals('', $redirect);

        $redirect = Website::getRedirect('languageforge.org');
        $this->assertEquals('', $redirect);

        $redirect = Website::getRedirect('www.languageforge.org');
        $this->assertEquals('https://languageforge.org', $redirect);
    }
}
