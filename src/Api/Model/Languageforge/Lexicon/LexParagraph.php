<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ObjectForEncoding;

class LexParagraph extends ObjectForEncoding
{
    public function __construct($guid = '', $styleName = '')
    {
        $this->setReadOnlyProp('guid');
        if (!$guid || !Guid::isValid($guid)) $guid = Guid::create();
        $this->guid = $guid;
        $this->setPrivateProp('styleName');
        $this->styleName = $styleName;
    }

    /** @var string */
    public $guid;

    /** @var string */
    public $content;

    /** @var string */
    public $styleName;
}
