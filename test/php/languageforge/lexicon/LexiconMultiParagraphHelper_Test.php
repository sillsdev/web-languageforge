<?php

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class TestLexiconMultiParagraphHelper extends UnitTestCase
{
    public function testToHTMLAndFromHTML_existingModel_roundTripDataIdentical()
    {
        $inputSystem = 'en';
        $model = new \Api\Model\Languageforge\Lexicon\LexiconMultiParagraph();
        $model->inputSystem = $inputSystem;

        $paragraph1 = new \Api\Model\Languageforge\Lexicon\LexiconMultiParagraphItem();
        $paragraph1->guid = 1234567;
        $paragraph1->styleName = "styleA";
        $paragraph1->content = "This is the first string in <span lang='de'>die Deutsche Sprache</span>";
        $model->paragraphs->append($paragraph1);

        $paragraph2 = new \Api\Model\Languageforge\Lexicon\LexiconMultiParagraphItem();
        $paragraph2->guid = 54321;
        $paragraph2->styleName = "styleB";
        $paragraph2->content = "This is the second string in <span lang='es'>la lingua Espanol</span>";
        $model->paragraphs->append($paragraph2);

        $paragraph3 = new \Api\Model\Languageforge\Lexicon\LexiconMultiParagraphItem();
        $paragraph3->guid = 9989;
        $paragraph3->styleName = "styleC";
        $paragraph3->content = "This is the third string in <span lang='pt'>a lingua Portugues</span>";
        $model->paragraphs->append($paragraph3);

        $html = \Api\Model\Languageforge\Lexicon\LexiconMultiParagraphHelper::toHTML($model);
        $this->assertTrue(is_string($html));

        $newModel = \Api\Model\Languageforge\Lexicon\LexiconMultiParagraphHelper::fromHTML($inputSystem, $html);

        $this->assertCopy($model, $newModel);
    }
}
