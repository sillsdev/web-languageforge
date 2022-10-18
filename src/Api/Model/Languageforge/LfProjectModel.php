<?php

namespace Api\Model\Languageforge;

use Api\Model\Shared\ProjectModel;

class LfProjectModel extends ProjectModel
{
    // define languageforge project types here
    const LEXICON_APP = "lexicon";

    public function __construct($id = "")
    {
        parent::__construct($id);
    }

    /** @var string The ISO 639 language code */
    public $languageCode;
}
