<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

function generateMultiParagraphItem() {
    return new LexParagraph();
}

class LexMultiParagraph extends ObjectForEncoding
{
    use LazyPropertiesTrait;
    
    public function __construct()
    {
        $this->initLazyProperties(['paragraphs'], false);
    }

    protected function createProperty($name) {
        switch ($name) {
            case 'paragraphs':
                return new ArrayOf('\Api\Model\Languageforge\Lexicon\generateMultiParagraphItem');
            default:
                return '';
        }
    }

    /** @var string */
    public $inputSystem;

    /** @var ArrayOf LexParagraph */
    public $paragraphs;


    /**
     * @return string
     */
    public function toHTML() {
        $html = "";
        foreach ($this->paragraphs as $paragraph) {
            $html .= "<p guid='" . $paragraph->guid . "'>";
            $html .= "<p styleName='" . $paragraph->styleName . "'>";
            $html .= $paragraph->content;
            $html .= "</p>";
        }
        return $html;
    }

    /**
     * @param $html string
     */
    public function fromHTML($html) {
        $dom = new \DOMDocument();
        $dom->loadHTML($html);
        $this->paragraphs->exchangeArray(array());
        /** @var \DOMNode $node */
        foreach ($dom->getElementsByTagName('p') as $node) {
            $paragraph = new LexParagraph();
            $paragraph->guid = $node->getAttribute('guid');
            $paragraph->styleName = $node->getAttribute('styleName');
            $paragraph->content = self::innerHTML($node);
            $this->paragraphs->append($paragraph);
        }
    }


    /**
     * @param \DOMNode $element
     * @return string
     */
    private static function innerHTML(\DOMNode $element)
    {
        $innerHTML = "";
        $children  = $element->childNodes;

        foreach ($children as $child)
        {
            $innerHTML .= $element->ownerDocument->saveHTML($child);
        }

        return $innerHTML;
    }
}
