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
        $this->guid = Guid::makeValid($guid);
    }

    /** @var string */
    public $fileName;

    /** @var LexMultiText */
    public $caption;

    /** @var string */
    public $guid;
}
