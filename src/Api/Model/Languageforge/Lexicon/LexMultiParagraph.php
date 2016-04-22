<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ArrayOf;

function _createMultiParagraphItem() {
    return new LexMultiParagraphItem();
}


class LexMultiParagraph
{
    use \LazyProperty\LazyPropertiesTrait;
    
    public function __construct()
    {
        $this->initLazyProperties(['paragraphs'], false);
    }
    
    protected function createProperty($name) {
       switch ($name) {
           case 'paragraphs':
               return new ArrayOf('\Api\Model\Languageforge\Lexicon\_createMultiParagraphItem');
       }
    }

    public $inputSystem;

    /**
     * @var ArrayOf LexMultiParagraphItem
     */
    public $paragraphs;


    /**
     * @return string
     */
    public function toHTML() {
        $html = "";
        foreach ($this->paragraphs as $paragraph) {
            $html .="<p guid='" . $paragraph->guid . "'>";
            $html .="<p styleName='" . $paragraph->styleName . "'>";
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
        foreach ($dom->getElementsByTagName('p') as $node) {
            $paragraph = new LexMultiParagraphItem();
            $paragraph->guid = $node->getAttribute('guid');
            $paragraph->styleName = $node->getAttribute('styleName');
            $paragraph->content = self::_innerHTML($node);
            $this->paragraphs->append($paragraph);
        }
    }


    /**
     * @param \DOMNode $element
     * @return string
     */
    private static function _innerHTML(\DOMNode $element)
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
