<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Shared\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

class LexParagraph extends ObjectForEncoding
{
    use LazyPropertiesTrait;
    public function __construct($guid = "", $styleName = "")
    {
        $this->setReadOnlyProp("guid");
        $this->guid = Guid::makeValid($guid);
        $this->setPrivateProp("styleName");
        $this->initLazyProperties(["content", "styleName"], false);
        if ($styleName) {
            $this->styleName = $styleName;
        }
    }

    protected function getPropertyType(string $name)
    {
        switch ($name) {
            default:
                return "string";
        }
    }

    protected function createProperty(string $name)
    {
        switch ($this->getPropertyType($name)) {
            case "string":
            default:
                return "";
        }
    }

    /** @var string */
    public $guid;

    /** @var string */
    public $content;

    /** @var string */
    public $styleName;
}
