<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;

class LexCaptionsConfigObj extends LexiconMultitextConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = LexiconConfigObj::CAPTIONS;
        $this->label = 'Captions';
    }

}
