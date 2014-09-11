<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;

class LexPicturesConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::PICTURES;
        $this->label = 'Pictures';
        $this->captionLabel = 'Captions';
        $this->inputSystems = new ArrayOf();
    }

    /**
     * @var string
     */
    public $label;

    /**
     * @var string
     */
    public $captionLabel;

    /**
     * @var ArrayOf
     */
    public $inputSystems;

}
