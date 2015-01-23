<?php

namespace models\languageforge\semdomtrans;

use models\mapper\Id;

class SemDomTransTranslatedForm
{
	public function __construct()
	{
		$this->translation = '';
		$this->status = SemDomTransStatus::Suggested;
	}
    public function __construct($translation='')
    {
        $this->translation = $translation;
		$this->status = SemDomTransStatus::Suggested;
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
