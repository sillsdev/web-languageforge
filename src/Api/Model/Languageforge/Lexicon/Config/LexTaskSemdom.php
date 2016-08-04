<?php

namespace Api\Model\Languageforge\Lexicon\Config;

use Api\Model\Mapper\MapOf;

class LexTaskSemdom extends LexTask
{
    public function __construct()
    {
        $this->language = 'en';
        $this->visibleFields = new MapOf();
        $this->type = LexTask::SEMDOM;

        // default values
        $this->visibleFields['definition'] = true;
        $this->visibleFields['partOfSpeech'] = true;
        $this->visibleFields['example'] = true;
        $this->visibleFields['translation'] = true;
        parent::__construct();
    }

    /** @var string */
    public $language;

    /** @var MapOf<boolean> */
    public $visibleFields;
}
