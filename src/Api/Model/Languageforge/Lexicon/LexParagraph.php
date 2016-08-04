<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ObjectForEncoding;
use LazyProperty\LazyPropertiesTrait;

class LexParagraph extends ObjectForEncoding
{
    use LazyPropertiesTrait;
    public function __construct($guid = '', $styleName = '')
    {
        $this->setReadOnlyProp('guid');
        $this->guid = Guid::makeValid($guid);
        $this->setPrivateProp('styleName');
        $this->initLazyProperties(['content', 'styleName'], false);
        if ($styleName) {
            $this->styleName = $styleName;
        }
    }

    protected function createProperty($name) {
        switch ($name) {
            default:
                return '';
        }
    }

    /** @var string */
    public $guid;

    /** @var string */
    public $content;

    /** @var string */
    public $styleName;
}
