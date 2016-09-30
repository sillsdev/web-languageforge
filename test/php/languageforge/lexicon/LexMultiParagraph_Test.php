<?php

use Api\Model\Languageforge\Lexicon\Command\LexEntryDecoder;
use Api\Model\Languageforge\Lexicon\Dto\LexDbeDtoEntriesEncoder;
use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexParagraph;
use Api\Model\Mapper\MapOf;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class MultiParagraphInMap
{
    public function __construct()
    {
        $this->data = new MapOf(function() {
            return new LexMultiParagraph();
        });
    }

    /** @var MapOf<LexMultiParagraph> */
    public $data;
}

class TestLexMultiParagraph extends UnitTestCase
{
    public function testToHTMLAndFromHTML_ExistingModel_RoundTripDataIdentical()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = 'en';

        $paragraph1 = new LexParagraph();
        $paragraph1->styleName = 'styleA';
        $paragraph1->content = 'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>';
        $multiParagraph->paragraphs->append($paragraph1);

        $paragraph2 = new LexParagraph();
        $paragraph2->content = 'This is the second paragraph in <span lang="es">la lingua Espanol</span>';
        $multiParagraph->paragraphs->append($paragraph2);

        $paragraph3 = new LexParagraph();
        $paragraph3->styleName = 'styleC';
        $multiParagraph->paragraphs->append($paragraph3);

        $html = $multiParagraph->toHtml();
        $this->assertTrue(is_string($html));

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHtml($html);

        $this->assertClone($multiParagraph, $newMultiParagraph);
    }

    public function testFromHTML_MultipleClassValues_GuidExtracted()
    {
        $paragraph = new LexParagraph();
        $paragraph->styleName = 'styleA';
        $paragraph->content = 'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>';
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = '';
        $multiParagraph->paragraphs->append($paragraph);

        $html = '<p lang="" class="firstClassValue guid_' . $paragraph->guid . ' styleName_' . $paragraph->styleName .
            ' fourthClassValue'.'">' . $paragraph->content . '</p>';
        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHtml($html);

        $this->assertClone($multiParagraph, $newMultiParagraph);
    }

    public function testDecode_EmptyMultiParagraph_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertEqual($multiParagraph, $newMultiParagraph);
        $this->assertClone($multiParagraph->paragraphs, $newMultiParagraph->paragraphs);
    }

    public function testDecode_CRMultiParagraph_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);
        $params['paragraphsHtml'] = "\r";

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertEqual($multiParagraph, $newMultiParagraph);
        $this->assertClone($multiParagraph->paragraphs, $newMultiParagraph->paragraphs);
    }

    public function testDecode_ExistingModelAndMapOf_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = 'en';

        $paragraph1 = new LexParagraph();
        $paragraph1->styleName = 'styleA';
        $paragraph1->content = 'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>';
        $multiParagraph->paragraphs->append($paragraph1);

        $paragraph2 = new LexParagraph();
        $paragraph2->content = 'This is the second paragraph in <span lang="es">la lingua Espanol</span>';
        $multiParagraph->paragraphs->append($paragraph2);

        $paragraph3 = new LexParagraph();
        $paragraph3->styleName = 'styleC';
        $multiParagraph->paragraphs->append($paragraph3);

        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $key = 'customField_entry_Cust_MultiPara';
        $newTestMapOf = new MultiParagraphInMap();
        $newTestMapOf->data[$key] = clone $newMultiParagraph;

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertClone($multiParagraph, $newMultiParagraph);

        $testMapOf = new MultiParagraphInMap();
        $testMapOf->data[$key] = $multiParagraph;
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($testMapOf)), true);

        LexEntryDecoder::decode($newTestMapOf, $params);

        $this->assertEqual($testMapOf->data[$key]->guid, $newTestMapOf->data[$key]->guid);
        $this->assertClone($testMapOf, $newTestMapOf);
    }
}
