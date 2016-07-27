<?php

use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexParagraph;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestLexMultiParagraph extends UnitTestCase
{
    public function testToHTMLAndFromHTML_ExistingModel_RoundTripDataIdentical()
    {
        $inputSystem = 'en';
        $multiParagraph = new LexMultiParagraph();
        $multiParagraph->inputSystem = $inputSystem;

        $paragraph1 = new LexParagraph();
        $paragraph1->styleName = "styleA";
        $paragraph1->content = "This is the first string in <span lang='de'>die Deutsche Sprache</span>";
        $multiParagraph->paragraphs->append($paragraph1);

        $paragraph2 = new LexParagraph();
        $paragraph2->styleName = "styleB";
        $paragraph2->content = "This is the second string in <span lang='es'>la lingua Espanol</span>";
        $multiParagraph->paragraphs->append($paragraph2);

        $paragraph3 = new LexParagraph();
        $paragraph3->styleName = "styleC";
        $paragraph3->content = "This is the third string in <span lang='pt'>a lingua Portugues</span>";
        $multiParagraph->paragraphs->append($paragraph3);

        $html = $multiParagraph->toHTML();
        $this->assertTrue(is_string($html));

        $newModel = new LexMultiParagraph();
        $newModel->fromHTML($html);
        $newModel->inputSystem = $inputSystem;

        $this->assertCopy($multiParagraph, $newModel);
    }
}
