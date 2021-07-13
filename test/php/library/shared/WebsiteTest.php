<?php

use Api\Library\Shared\Website;
use PHPUnit\Framework\TestCase;

class WebsiteTest extends TestCase
{
    public function testGet_Works()
    {
        $website = Website::get();
        $this->assertEquals('languageforge.org', $website->domain);
        $this->assertEquals('languageforge', $website->base);
        $this->assertEquals('default', $website->theme);

        $website = Website::get('randomdomain.com');
        $this->assertNull($website);
    }
}
