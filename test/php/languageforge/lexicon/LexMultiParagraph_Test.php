<?php

use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexParagraph;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

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
        $paragraph2->styleName = 'styleB';
        $paragraph2->content = 'This is the second paragraph in <span lang="es">la lingua Espanol</span>';
        $multiParagraph->paragraphs->append($paragraph2);

        $paragraph3 = new LexParagraph();
        $paragraph3->styleName = 'styleC';
        $paragraph3->content = 'This is the third paragraph in <span lang="pt">a lingua Portugues</span>';
        $multiParagraph->paragraphs->append($paragraph3);

        $html = $multiParagraph->toHTML();
        $this->assertTrue(is_string($html));

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHTML($html);

        $this->assertClone($multiParagraph, $newMultiParagraph);
    }

    public function testFromHTML_MultipleClassValues_GuidExtracted()
    {
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = '';

        $paragraph = new LexParagraph();
        $paragraph->styleName = 'styleA';
        $paragraph->content = 'This is the first paragraph in <span lang="de">die Deutsche Sprache</span>';
        $multiParagraph->paragraphs->append($paragraph);

        $html = '<p lang="" class="firstClassValue guid_' . $paragraph->guid . ' styleName_' . $paragraph->styleName .
            ' fourthClassValue'.'">' . $paragraph->content . '</p>';

        $newMultiParagraph = new LexMultiParagraph($multiParagraph->guid);
        $newMultiParagraph->fromHTML($html);

        $this->assertClone($multiParagraph, $newMultiParagraph);
    }
}
