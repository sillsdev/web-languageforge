<?php

namespace Api\Model\Languageforge\Lexicon;

class Picture
{
    public function __construct($fileName = '', $guid = '')
    {
        $this->fileName = $fileName;
        $this->caption = new MultiText();
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
