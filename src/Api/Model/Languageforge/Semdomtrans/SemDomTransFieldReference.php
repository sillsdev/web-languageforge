<?php

namespace Api\Model\Languageforge\Semdomtrans;

class SemDomTransFieldReference {
	public function __construct($fieldName = '', $sourceVal = '', $translationVal = '', $status = SemDomTransStatus::Draft) {
        $this->fieldName = $fieldName;
        $this->sourceVal = $sourceVal;
        $this->translationVal = $translationVal;
        $this->status = $status;
    }

    /**
     * @var string
     */
    public $fieldName;

    /**
     * @var string
     */
    public $sourceVal;
    
    /**
     * @var string
     */
    public $translationVal;
    
    
    /**
     * @var SemDomTransStatus
     */
    public $status;   
}
