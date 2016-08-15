<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Model\Mapper\ArrayOf;
use Api\Model\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

function generateParagraph() {
    return new LexParagraph();
}

class LexMultiParagraph extends ObjectForEncoding
{
    use LazyPropertiesTrait;

    public function __construct($guid = '')
    {
        $this->setReadOnlyProp('guid');
        $this->guid = Guid::makeValid($guid);
        $this->initLazyProperties(['paragraphs'], false);
    }

    protected function createProperty($name) {
        switch ($name) {
            case 'paragraphs':
                return new ArrayOf('Api\Model\Languageforge\Lexicon\generateParagraph');
            default:
                return '';
        }
    }

    /** @var string */
    public $guid;

    /** @var string */
    public $inputSystem;

    /** @var ArrayOf LexParagraph */
    public $paragraphs;

    /**
     * @return string
     */
    public function toHtml() {
        $html = '';
        /** @var LexParagraph $paragraph */
        foreach ($this->paragraphs as $paragraph) {
            $html .= '<p';
            $html .= ' lang="' . $this->inputSystem . '"';
            $html .= ' class="guid_' . $paragraph->guid;
            if (isset($paragraph->styleName)) {
                $html .= ' styleName_' . $paragraph->styleName;
            }
            $html .= '">';
            if (isset($paragraph->content)) {
                $html .= $paragraph->content;
            }
            $html .= '</p>';
        }
        return $html;
    }

    /**
     * @param $html string
     */
    public function fromHtml($html) {
        $this->paragraphs->exchangeArray(array());
        if (trim($html)) {
            $dom = new \DOMDocument();
            $dom->loadHTML(trim($html));
            /** @var \DOMElement $node */
            foreach ($dom->getElementsByTagName('p') as $node) {
                $this->inputSystem = $node->getAttribute('lang');
                $paragraph = new LexParagraph();
                foreach (explode(' ', $node->getAttribute('class')) as $classValue) {
                    if (StringUtil::startsWith($classValue, 'guid_')) {
                        $guid = substr($classValue, 5);
                        if ($guid) {
                            $paragraph->guid = $guid;
                        }
                    }
                    if (StringUtil::startsWith($classValue, 'styleName_')) {
                        $styleName = substr($classValue, 10);
                        if ($styleName) {
                            $paragraph->styleName = $styleName;
                        }
                    }
                }
                $content = LiftDecoder::sanitizeSpans($node, $this->inputSystem);
                if ($content) {
                    $paragraph->content = $content;
                }
                $this->paragraphs->append($paragraph);
            }
        }
    }
}
