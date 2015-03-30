<?php

namespace models\languageforge\semdomtrans;

use models\mapper\Id;

class SemDomTransQuestion
{
    public function __construct($q='', $terms='')
    {
        $this->question = new SemDomTransTranslatedForm($q);
        $this->terms = new SemDomTransTranslatedForm($terms);
    }

    /**
     * @var SemDomTransTranslatedForm
     */
    public $question;

    /**
     * @var SemDomTransTranslatedForm
     */
    public $terms;
}
