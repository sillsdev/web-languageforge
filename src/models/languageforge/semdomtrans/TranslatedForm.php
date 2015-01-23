<?php

namespace models\languageforge\semdomtrans;

use models\mapper\Id;

class TranslatedForm
{
	public function __construct()
	{
		$this->translation = '';
		$this->status = Status::Suggested;
	}
    public function __construct($translation='')
    {
        $this->translation = $translation;
        $this->status = Status::Suggested;
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
