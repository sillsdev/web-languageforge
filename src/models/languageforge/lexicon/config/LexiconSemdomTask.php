<?php

namespace models\languageforge\lexicon\config;

use models\mapper\MapOf;

class LexiconSemdomTask extends LexiconTask
{
    public function __construct()
    {
        $this->language = 'en';
        $this->visibleFields = new MapOf();
        $this->type = LexiconTask::SEMDOM;

        // default values
        $this->visibleFields['definition'] = true;
        $this->visibleFields['partOfSpeech'] = true;
        $this->visibleFields['example'] = true;
        $this->visibleFields['translation'] = true;
        parent::__construct();
    }

    /**
     *
     * @var string
     */
    public $language;

    /**
     *
     * @var MapOf<boolean>
     */
    public $visibleFields;

}
