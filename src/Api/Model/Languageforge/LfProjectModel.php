<?php

namespace Api\Model\Languageforge;

use Api\Model\ProjectModel;

class LfProjectModel extends ProjectModel
{
    // define languageforge project types here
    const LEXICON_APP = 'lexicon';
    const SEMDOMTRANS_APP = 'semdomtrans';

    public function __construct($id = '')
    {
        parent::__construct($id);
    }

    /**
     * The ISO 639 language code
     * @var string
     */
    public $languageCode;
}
