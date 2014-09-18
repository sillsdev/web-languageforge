<?php

namespace models\languageforge\lexicon\config;

class LexPicturesConfigObj extends LexiconConfigObj
{
    public function __construct()
    {
        $this->type = LexiconConfigObj::PICTURES;
        $this->label = 'Pictures';
        $this->caption = new LexCaptionsConfigObj();
    }

    /**
     * @var string
     */
    public $label;

    /**
     *
     * @var LexCaptionsConfigObj
     */
    public $caption;

}
