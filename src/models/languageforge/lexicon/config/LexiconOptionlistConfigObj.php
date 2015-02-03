<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;

class LexiconOptionlistConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::OPTIONLIST;
        $this->values = new ArrayOf(function ($data) {
            return new LexiconOptionListItem('');
        });

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
