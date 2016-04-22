<?php

namespace Api\Model\Languageforge\Lexicon;

class LexiconMultiParagraphHelper
{
    /**
     * @param $model LexiconMultiParagraph
     * @return string
     */
    static function toHTML($model) {
        $html = "";
        foreach ($model->paragraphs as $paragraph) {
            $html .="<p guid='" . $paragraph->guid . "'>";
            $html .="<p styleName='" . $paragraph->styleName . "'>";
            $html .= $paragraph->content;
            $html .= "</p>";
        }
        return $html;
    }

    /**
     * @param $inputSystem string
     * @param $html string
     * @return LexiconMultiParagraph
     */
    static function fromHTML($inputSystem, $html) {
        $model = new LexiconMultiParagraph();
        $model->inputSystem = $inputSystem;

        $dom = new \DOMDocument();
        $dom->loadHTML($html);
        foreach ($dom->getElementsByTagName('p') as $node) {
            $paragraph = new LexiconMultiParagraphItem();
            $paragraph->guid = $node->getAttribute('guid');
            $paragraph->styleName = $node->getAttribute('styleName');
            $paragraph->content = self::_innerHTML($node);
            $model->paragraphs->append($paragraph);
        }

        return $model;
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