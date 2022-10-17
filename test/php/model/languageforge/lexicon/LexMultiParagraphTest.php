<?php

use Api\Model\Languageforge\Lexicon\Command\LexEntryDecoder;
use Api\Model\Languageforge\Lexicon\Dto\LexDbeDtoEntriesEncoder;
use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexParagraph;
use Api\Model\Shared\Mapper\MapOf;
use PHPUnit\Framework\TestCase;

class MultiParagraphInMap
{
    public function __construct()
    {
        $this->data = new MapOf(function () {
            return new LexMultiParagraph();
        });
    }

    /** @var MapOf<LexMultiParagraph> */
    public $data;
}

class LexMultiParagraphTest extends TestCase
{
    public function addParagraph(LexMultiParagraph $multiPara, string $content = null, string $styleName = null)
    {
        $newPara = new LexParagraph();
        if (isset($content)) {
            $newPara->content = $content;
        }
        if (isset($styleName)) {
            $newPara->styleName = $styleName;
        }
        $multiPara->paragraphs->append($newPara);
    }

    public function testToHTMLAndFromHTML_ExistingModel_RoundTripDataIdentical()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $html = $multiParagraph->toHtml();
        $this->assertTrue(is_string($html));

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHtml($html);

        $this->assertEquals($multiParagraph, $newMultiParagraph);
    }

    public function testToHTMLAndFromHTML_ExistingModel_RoundTripDataProducesNoDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $html = $multiParagraph->toHtml();
        $this->assertTrue(is_string($html));

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHtml($html);

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals([], $differences);
    }

    public function testToHTMLAndFromHTML_ExistingModel_DifferencesFunctionDoesNotTestGuidChanges()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $html = $multiParagraph->toHtml();
        $this->assertTrue(is_string($html));

        $newMultiParagraph = new LexMultiParagraph(); // We do not re-use $multiParagraph->guid here, so the new paragraph has a *different* GUID
        $newMultiParagraph->fromHtml($html);

        $differences = $multiParagraph->differences($newMultiParagraph);
        // The differences() function does not care about GUIDs, so this time too, it will produce no differences
        $this->assertEquals([], $differences);
    }

    public function testDifferences_SameObject_NoDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $newMultiParagraph = $multiParagraph;
        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals([], $differences);
    }

    public function testDifferences_SameDataDifferentObject_NoDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $this->addParagraph(
            $newMultiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $newMultiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($newMultiParagraph, null, "styleC");

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals([], $differences);
    }

    public function testDifferences_OnePaaragraphRemoved_AllParagraphsInDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $this->addParagraph(
            $newMultiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $newMultiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals(
            ["this" => $multiParagraph->toHtml(), "other" => $newMultiParagraph->toHtml()],
            $differences
        );
    }

    public function testDifferences_OnePaaragraphAdded_AllParagraphsInDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $this->addParagraph(
            $newMultiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $newMultiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($newMultiParagraph, null, "styleC");

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals(
            ["this" => $multiParagraph->toHtml(), "other" => $newMultiParagraph->toHtml()],
            $differences
        );
    }

    public function testDifferences_WeHaveNoParagraphsAndTheyDo_AllParagraphsInDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $this->addParagraph(
            $newMultiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $newMultiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($newMultiParagraph, null, "styleC");

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals(
            ["this" => $multiParagraph->toHtml(), "other" => $newMultiParagraph->toHtml()],
            $differences
        );
    }

    public function testDifferences_TheyHaveNoParagraphsAndWeDo_AllParagraphsInDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals(
            ["this" => $multiParagraph->toHtml(), "other" => $newMultiParagraph->toHtml()],
            $differences
        );
    }

    public function testDifferences_NoParagraphsForUsOrThem_NoDifferences()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $newMultiParagraph = new LexMultiParagraph();
        $newMultiParagraph->inputSystem = "en";

        $differences = $multiParagraph->differences($newMultiParagraph);
        $this->assertEquals([], $differences);
    }

    public function testFromHTML_MultipleClassValues_GuidExtracted()
    {
        $paragraph = new LexParagraph();
        $paragraph->styleName = "styleA";
        $paragraph->content = 'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>';
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "";
        $multiParagraph->paragraphs->append($paragraph);

        $html =
            '<p lang="" class="firstClassValue guid_' .
            $paragraph->guid .
            " styleName_" .
            $paragraph->styleName .
            " fourthClassValue" .
            '">' .
            $paragraph->content .
            "</p>";
        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHtml($html);

        $this->assertEquals($multiParagraph, $newMultiParagraph);
    }

    public function testDecode_EmptyMultiParagraph_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertEquals($multiParagraph, $newMultiParagraph);
        $this->assertEquals($multiParagraph->paragraphs, $newMultiParagraph->paragraphs);
    }

    public function testDecode_CRMultiParagraph_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);
        $params["paragraphsHtml"] = "\r";

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertEquals($multiParagraph, $newMultiParagraph);
        $this->assertEquals($multiParagraph->paragraphs, $newMultiParagraph->paragraphs);
    }

    public function testDecode_ExistingModelAndMapOf_DecodeOk()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = "en";

        $this->addParagraph(
            $multiParagraph,
            'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>',
            "styleA"
        );
        $this->addParagraph(
            $multiParagraph,
            'This is the second paragraph in <span lang="es">la lingua Espanol</span>'
        );
        $this->addParagraph($multiParagraph, null, "styleC");

        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($multiParagraph)), true);

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $key = "customField_entry_Cust_MultiPara";
        $newTestMapOf = new MultiParagraphInMap();
        $newTestMapOf->data[$key] = clone $newMultiParagraph;

        LexEntryDecoder::decode($newMultiParagraph, $params);

        $this->assertEquals($multiParagraph, $newMultiParagraph);

        $testMapOf = new MultiParagraphInMap();
        $testMapOf->data[$key] = $multiParagraph;
        $params = json_decode(json_encode(LexDbeDtoEntriesEncoder::encode($testMapOf)), true);

        LexEntryDecoder::decode($newTestMapOf, $params);

        $this->assertEquals($testMapOf->data[$key]->guid, $newTestMapOf->data[$key]->guid);
        $this->assertEquals($testMapOf, $newTestMapOf);
    }
}
