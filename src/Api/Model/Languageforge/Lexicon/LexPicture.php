<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ObjectForEncoding;

class LexPicture extends ObjectForEncoding
{
    public function __construct($fileName = '', $guid = '')
    {
        $this->fileName = $fileName;
        $this->caption = new LexMultiText();
        $this->setReadOnlyProp('guid');
        if (!$guid || !Guid::isValid($guid)) $guid = Guid::create();
        $this->guid = $guid;
    }

    /** @var string */
    public $fileName;

    /** @var LexMultiText */
    public $caption;

    /** @var string */
    public $guid;
}
