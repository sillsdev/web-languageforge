<?php

use Api\Model\Scriptureforge\Sfchecks\Dto\UsxHelper;
use PHPUnit\Framework\TestCase;

class UsxHelperTest extends TestCase
{
    public function testAsHtml_works()
    {
        $usx = MongoTestEnvironment::usxSample();

        $usxHelper = new UsxHelper($usx);
        $result = $usxHelper->toHtml();
        $this->assertRegExp('/<sup>4<\\/sup>In him was life; and the life was the light of men\\./', $result);
        //echo $result;
    }

    public function testAsHtml_footnotesWork()
    {
        $usx = MongoTestEnvironment::usxSampleWithNotes();

        $usxHelper = new UsxHelper($usx);
        $result = $usxHelper->toHtml();

        // Footnotes should be processed
        $this->assertRegExp('/<div id="footnotes">.*Footnote for testing.*<\\/div>/s', $result);
        // But cross-reference notes should not
        $this->assertNotRegExp('/<div id="footnotes">.*Jr 17\\.8.*<\\/div>/s', $result);
    }

    public function testGetMetadata_Ok()
    {
        $usx = MongoTestEnvironment::usxSample();

        $usxHelper = new UsxHelper($usx);
        $info = $usxHelper->getMetadata();
        $this->assertEquals('JHN', $info['bookCode']);
        $this->assertEquals(1, $info['startChapter']);
        $this->assertEquals(21, $info['endChapter']);
        $this->assertEquals(1, $info['startVerse']);
        $this->assertEquals(25, $info['endVerse']);
    }

}
