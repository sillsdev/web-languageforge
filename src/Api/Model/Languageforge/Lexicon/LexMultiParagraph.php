<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Model\Languageforge\Lexicon\Import\LiftDecoder;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

function generateParagraph()
{
    return new LexParagraph();
}

class LexMultiParagraph extends ObjectForEncoding
{
    use LazyPropertiesTrait;

    public function __construct($guid = "")
    {
        $this->setReadOnlyProp("guid");
        $this->guid = Guid::makeValid($guid);
        $this->initLazyProperties(["paragraphs"], false);
    }

    protected function getPropertyType(string $name)
    {
        switch ($name) {
            case "paragraphs":
                return "ArrayOf(LexParagraph)";
            default:
                return "string";
        }
    }

    protected function createProperty($name)
    {
        switch ($this->getPropertyType($name)) {
            case "ArrayOf(LexParagraph)":
                return new ArrayOf("Api\Model\Languageforge\Lexicon\generateParagraph");

            case "string":
            default:
                return "";
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
    public function toHtml()
    {
        $html = "";
        /** @var LexParagraph $paragraph */
        foreach ($this->paragraphs as $paragraph) {
            $html .= "<p";
            $html .= ' lang="' . $this->inputSystem . '"';
            $html .= ' class="guid_' . $paragraph->guid;
            if (isset($paragraph->styleName)) {
                $html .= " styleName_" . $paragraph->styleName;
            }
            $html .= '">';
            if (isset($paragraph->content)) {
                $html .= $paragraph->content;
            }
            $html .= "</p>";
        }
        return $html;
    }

    /**
     * @param $html string
     */
    public function fromHtml($html)
    {
        $this->paragraphs->exchangeArray([]);
        if (trim($html)) {
            $dom = new \DOMDocument();
            $dom->loadHTML(trim($html));
            /** @var \DOMElement $node */
            foreach ($dom->getElementsByTagName("p") as $node) {
                $this->inputSystem = $node->getAttribute("lang");
                $paragraph = new LexParagraph();
                foreach (explode(" ", $node->getAttribute("class")) as $classValue) {
                    if (StringUtil::startsWith($classValue, "guid_")) {
                        $guid = substr($classValue, 5);
                        if ($guid) {
                            $paragraph->guid = $guid;
                        }
                    }
                    if (StringUtil::startsWith($classValue, "styleName_")) {
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

    protected function calculateDifferences(LexMultiParagraph $otherMultiParagraph)
    {
        // We won't try to diff the content; it's harder than it's worth since this is just for the activity feed.
        $thisHtml = $this->toHtml();
        $otherHtml = $otherMultiParagraph->toHtml();
        return ["this" => $thisHtml, "other" => $otherHtml];
    }

    public function differences(LexMultiParagraph $otherMultiParagraph)
    {
        $same = true;
        $len = $this->paragraphs->count();
        if ($otherMultiParagraph->paragraphs->count() !== $len) {
            return $this->calculateDifferences($otherMultiParagraph);
        }
        for ($i = 0; $i < $len; $i++) {
            // This is the simplest way to step through both arrays
            if ($this->paragraphs[$i]->content !== $otherMultiParagraph->paragraphs[$i]->content) {
                return $this->calculateDifferences($otherMultiParagraph);
            }
        }
        return [];
    }
}
