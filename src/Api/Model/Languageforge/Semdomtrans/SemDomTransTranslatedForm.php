<?php

namespace Api\Model\Languageforge\Semdomtrans;

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
