<?php

namespace models\languageforge\lexicon\config;

class LexiconOptionlistConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::OPTIONLIST;

        // default values
        $this->label = '';
        $this->listCode = '';
    }

    /**
     * @var string
     */
    public $label;

    /**
     * @var string
     */
    public $listCode;

}
