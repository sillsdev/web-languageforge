<?php

namespace Api\Model\Languageforge\Lexicon;

class Picture
{
    public function __construct($fileName = '')
    {
        $this->fileName = $fileName;
        $this->caption = new MultiText();
    }

    /**
     * @var string
     */
    public $fileName;

    /**
     * @var MultiText
     */
    public $caption;

}
