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

    const usxJohn1WithScriptTag = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<usx version="2.0">
  <book code="JHN" style="id">43-JHN-kjv.sfm The King James Version of the Holy Bible Wednesday, October 14, 2009</book>
  <para style="ide">UTF-8</para>
  <para style="h">John</para>
  <para style="mt">The Gospel According to St. John</para>
  <chapter number="1" style="c" />
  <para style="p">
    <verse number="1" style="v" />In the beginning was the Word, and the Word was with God, and the Word was God. <verse number="2" style="v" />The same was in the beginning with God. <verse number="3" style="v" />All things were made by him; and without him was not any thing made that was made. <verse number="4" style="v" />In him was life; and the life was the light of men. <verse number="5" style="v" />And the light shineth in darkness; and the darkness comprehended it not.</para>
  <script type="text/javascript">var code = 'could be evil';</script>
</usx>
EOD;

    public function testAsHtml_ScriptTag_NoScriptTag()
    {
        $usx = self::usxJohn1WithScriptTag;
        $this->assertRegExp('/could be evil/', $usx);

        $usxHelper = new UsxHelper($usx);
        $result = $usxHelper->toHtml();

        $this->assertRegExp('/<sup>4<\\/sup>In him was life; and the life was the light of men\\./', $result);
        $this->assertNotRegExp('/could be evil/', $result);
        $this->assertEquals(3, substr_count($result, '<p'));
    }

    public function testAsHtml_VerseNewLine_VersesOnNewLines()
    {
        $usx = self::usxJohn1WithScriptTag;

        $usxHelper = new UsxHelper($usx, true);
        $result = $usxHelper->toHtml();

        $this->assertRegExp('/<\\/p><p><sup>4<\\/sup>In him was life; and the life was the light of men\\./', $result);
        $this->assertEquals(9, substr_count($result, '<p'));
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
