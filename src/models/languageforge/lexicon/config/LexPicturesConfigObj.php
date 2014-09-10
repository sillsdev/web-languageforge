<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;

class LexPicturesConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::PICTURES;
        $this->label = '';
        $this->inputSystems = new ArrayOf();
    }

    /**
     * @var string
     */
    public $label;

    /**
     * @var ArrayOf
     */
    public $inputSystems;

}
