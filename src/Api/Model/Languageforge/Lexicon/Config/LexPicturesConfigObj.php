<?php

namespace Api\Model\Languageforge\Lexicon\Config;

class LexPicturesConfigObj extends LexiconMultitextConfigObj
{
    public function __construct()
    {
        parent::__construct();
        $this->type = self::PICTURES;
        $this->label = 'Pictures';
        $this->captionLabel = 'Captions';
        $this->captionHideIfEmpty = true;
    }

    /** @var string */
    public $captionLabel;

    /** @var boolean */
    public $captionHideIfEmpty;

}
