<?php

namespace Api\Model\Languageforge\Lexicon;

use Api\Model\Mapper\ObjectForEncoding;

class Picture extends ObjectForEncoding
{
    public function __construct($fileName = '', $guid = '')
    {
        $this->fileName = $fileName;
        $this->caption = new MultiText();
        $this->setReadOnlyProp('guid');
        if ($guid) $this->guid = $guid;
    }

    /**
     * @var string
     */
    public $fileName;

    /**
     * @var MultiText
     */
    public $caption;

    /**
     * @var string
     */
    public $guid;

}
