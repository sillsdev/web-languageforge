<?php

namespace models\languageforge\semdomtrans;

use models\mapper\Id;

class SemDomTransTranslatedForm
{
    public function __construct($translation='')
    {
        $this->translation = $translation;
        $this->status = SemDomTransStatus::Draft;
    }

    /**
     * @var string
     */
    public $translation;

    /**
     * @var Status
     */
    public $status;
}
