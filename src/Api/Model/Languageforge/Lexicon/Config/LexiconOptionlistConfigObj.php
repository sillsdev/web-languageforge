<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexiconOptionlistConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::OPTIONLIST;

        // default values
        $this->listCode = '';
    }

    /**
     * @var string
     */
    public $listCode;

}
